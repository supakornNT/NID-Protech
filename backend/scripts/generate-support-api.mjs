import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const srcDir = path.join(root, 'src');

const ensureDir = (dir) => fs.mkdirSync(dir, { recursive: true });
const write = (file, content) => {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${content.trim()}\n`);
};

const pascal = (value) =>
  value
    .split(/[_-]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

const singularPascal = (resource) =>
  ({
    customers: 'Customer',
    staffs: 'Staff',
    teams: 'Team',
    roles: 'Role',
    staff_team_roles: 'StaffTeamRole',
    organizations: 'Organization',
    systems: 'System',
    problem_types: 'ProblemType',
    reports: 'Report',
    login_logs: 'LoginLog',
    tickets: 'Ticket',
    ticket_assignments: 'TicketAssignment',
    ticket_work_logs: 'TicketWorkLog',
    ticket_resolution_requests: 'TicketResolutionRequest',
    attachments: 'Attachment',
    report_status_logs: 'ReportStatusLog',
    ticket_status_logs: 'TicketStatusLog',
    report_confirmations: 'ReportConfirmation',
    screenings: 'Screening',
  })[resource] ?? pascal(resource).replace(/s$/, '');

const camel = (value) => {
  const p = singularPascal(value);
  return p.charAt(0).toLowerCase() + p.slice(1);
};

const joinLines = (lines, indent = 6) =>
  lines.map((line) => `${' '.repeat(indent)}${line}`).join('\n');

const scalarType = (field) => {
  if (field.tsType) return field.tsType;
  if (field.kind === 'number') return 'number';
  if (field.kind === 'date') return 'Date | null';
  return 'string';
};

const interfaceContent = (resource) => {
  const entity = singularPascal(resource.name);
  const lines = resource.interfaceFields.map(
    (field) => `  ${field.name}: ${scalarType(field)};`,
  );
  return `
import type { RowDataPacket } from 'mysql2/promise';

export interface ${entity} extends RowDataPacket {
${lines.join('\n')}
}
`;
};

const dtoContent = (resource, isUpdate) => {
  const entity = singularPascal(resource.name);
  const className = `${isUpdate ? 'Update' : 'Create'}${entity}Dto`;
  const bodyFields = resource.dtoFields
    .map((field) => {
      const type = field.kind === 'number' ? 'number' : 'string';
      const optional = isUpdate || field.optional ? '?' : '';
      return `  ${field.name}${optional}: ${type};`;
    })
    .join('\n\n');

  if (isUpdate) {
    return `
import { PartialType } from '@nestjs/mapped-types';
import { Create${entity}Dto } from './create-${resource.slug}.dto';

export class Update${entity}Dto extends PartialType(Create${entity}Dto) {}
`;
  }

  return `
export class ${className} {
${bodyFields}
}
`;
};

const buildSelect = (fields) => fields.map((field) => `      ${field}`).join(',\n');

const serviceContent = (resource) => {
  const entity = singularPascal(resource.name);
  const entityVar = camel(resource.name);
  const createDto = `Create${entity}Dto`;
  const updateDto = `Update${entity}Dto`;
  const interfaceImport = `${resource.slug}.interface`;
  const selectAll = buildSelect(resource.selectFields);
  const selectOne = buildSelect(resource.selectFields);
  const hasStatus = resource.columns.some((field) => field.name === 'status');
  const setColumns = resource.readOnly
    ? ''
    : resource.mutableFields.map((field) => `        ${field.column} = ?`).join(',\n');
  const updateValues = resource.readOnly
    ? ''
    : resource.mutableFields
        .map((field) => {
          const fallback = field.fallback ?? `current.${field.name}`;
          return `        dto.${field.name} ?? ${fallback},`;
        })
        .join('\n');
  const createColumns = resource.readOnly
    ? ''
    : resource.insertFields.map((field) => field.column).join(', ');
  const createPlaceholders = resource.readOnly
    ? ''
    : resource.insertFields.map(() => '?').join(', ');
  const createValues = resource.readOnly
    ? ''
    : resource.insertFields
        .map((field) => `        ${field.createValue ?? `dto.${field.name}`},`)
        .join('\n');

  const extraMethods = resource.extraMethods?.(entity) ?? '';
  const findOneBeforeUpdate = resource.readOnly
    ? ''
    : `
    const current = await this.findOne(id);

    if (!current) {
      return null;
    }
`;
  const removeMethod = resource.readOnly
    ? ''
    : `
  async remove(id: number) {
${hasStatus
  ? `    await this.db.query<ResultSetHeader>(
      'UPDATE ${resource.table} SET status = ? WHERE id = ?',
      ['inactive', id],
    );

    return this.findOne(id);`
  : `    await this.db.query<ResultSetHeader>(
      'DELETE FROM ${resource.table} WHERE id = ?',
      [id],
    );

    return { message: 'deleted' };`}
  }
`;

  return `
import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader } from 'mysql2/promise';
${resource.readOnly ? '' : `import { ${createDto} } from './dto/create-${resource.slug}.dto';\nimport { ${updateDto} } from './dto/update-${resource.slug}.dto';`}
import type { ${entity} } from './interfaces/${interfaceImport}';

@Injectable()
export class ${pascal(resource.name)}Service {
  constructor(@Inject('DB') private readonly db: Pool) {}

  async findAll(): Promise<${entity}[]> {
    const [rows] = await this.db.query<${entity}[]>(
      \`SELECT
${selectAll}
      FROM ${resource.fromClause}
${resource.findAllTail ? `${resource.findAllTail}\n` : ''}      \`,
    );

    return rows;
  }

  async findOne(id: number): Promise<${entity} | null> {
    const [rows] = await this.db.query<${entity}[]>(
      \`SELECT
${selectOne}
      FROM ${resource.fromClause}
      WHERE ${resource.idWhere ?? `${resource.table}.id = ?`}
${resource.findOneTail ? `${resource.findOneTail}\n` : ''}      \`,
      [id],
    );

    return rows[0] ?? null;
  }
${resource.readOnly
  ? ''
  : `
  async create(dto: ${createDto}): Promise<${entity} | null> {
    const [result] = await this.db.query<ResultSetHeader>(
      'INSERT INTO ${resource.table} (${createColumns}) VALUES (${createPlaceholders})',
      [
${createValues}
      ],
    );

    return this.findOne(result.insertId);
  }

  async update(id: number, dto: ${updateDto}): Promise<${entity} | null> {${findOneBeforeUpdate}
    await this.db.query<ResultSetHeader>(
      \`UPDATE ${resource.table}
      SET
${setColumns}
      WHERE id = ?\`,
      [
${updateValues}
        id,
      ],
    );

    return this.findOne(id);
  }
${removeMethod}`}
${extraMethods}
}
`;
};

const controllerContent = (resource) => {
  const entity = singularPascal(resource.name);
  const service = `${pascal(resource.name)}Service`;
  const serviceVar = camel(resource.name);
  const createDto = `Create${entity}Dto`;
  const updateDto = `Update${entity}Dto`;
  const extraImports = resource.extraControllerImports ?? '';
  const extraMethods = resource.extraControllerMethods?.(serviceVar) ?? '';
  return `
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
${resource.readOnly ? '' : `import { ${createDto} } from './dto/create-${resource.slug}.dto';\nimport { ${updateDto} } from './dto/update-${resource.slug}.dto';`}
import { ${service} } from './${resource.name}.service';
${extraImports}

@Controller('admin/${resource.route}')
export class ${pascal(resource.name)}Controller {
  constructor(private readonly ${serviceVar}: ${service}) {}

  @Get()
  findAll() {
    return this.${serviceVar}.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.${serviceVar}.findOne(id);
  }
${resource.readOnly
  ? ''
  : `
  @Post()
  create(@Body() body: ${createDto}) {
    return this.${serviceVar}.create(body);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: ${updateDto}) {
    return this.${serviceVar}.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.${serviceVar}.remove(id);
  }`}
${extraMethods}
}
`;
};

const moduleContent = (resource) => `
import { Module } from '@nestjs/common';
import { ${pascal(resource.name)}Controller } from './${resource.name}.controller';
import { ${pascal(resource.name)}Service } from './${resource.name}.service';

@Module({
  controllers: [${pascal(resource.name)}Controller],
  providers: [${pascal(resource.name)}Service],
  exports: [${pascal(resource.name)}Service],
})
export class ${pascal(resource.name)}Module {}
`;

const baseResources = [
  {
    name: 'customers',
    route: 'customers',
    slug: 'customer',
    table: 'customers',
    fromClause: 'customers',
    columns: [
      { name: 'id', kind: 'number' },
      { name: 'name' },
      { name: 'surname' },
      { name: 'email' },
      { name: 'phone' },
      { name: 'customer_type' },
      { name: 'status' },
      { name: 'created_at', kind: 'date' },
      { name: 'updated_at', kind: 'date' },
    ],
    interfaceFields: [
      { name: 'id', kind: 'number' },
      { name: 'name' },
      { name: 'surname' },
      { name: 'email' },
      { name: 'phone' },
      { name: 'customer_type' },
      { name: 'status' },
      { name: 'created_at', kind: 'date' },
      { name: 'updated_at', kind: 'date' },
    ],
    selectFields: [
      'customers.id',
      'customers.name',
      'customers.surname',
      'customers.email',
      'customers.phone',
      'customers.customer_type',
      'customers.status',
      'customers.created_at',
      'customers.updated_at',
    ],
    dtoFields: [
      { name: 'name' },
      { name: 'surname' },
      { name: 'email' },
      { name: 'phone' },
      { name: 'customer_type' },
      { name: 'status', optional: true },
    ],
    insertFields: [
      { name: 'name', column: 'name' },
      { name: 'surname', column: 'surname' },
      { name: 'email', column: 'email' },
      { name: 'phone', column: 'phone' },
      { name: 'customer_type', column: 'customer_type' },
      { name: 'status', column: 'status', createValue: "dto.status ?? 'pending'" },
    ],
    mutableFields: [
      { name: 'name', column: 'name' },
      { name: 'surname', column: 'surname' },
      { name: 'email', column: 'email' },
      { name: 'phone', column: 'phone' },
      { name: 'customer_type', column: 'customer_type' },
      { name: 'status', column: 'status' },
    ],
    extraMethods: () => `
  async approve(id: number) {
    await this.db.query<ResultSetHeader>(
      'UPDATE customers SET status = ? WHERE id = ?',
      ['approved', id],
    );

    return this.findOne(id);
  }

  async reject(id: number) {
    await this.db.query<ResultSetHeader>(
      'UPDATE customers SET status = ? WHERE id = ?',
      ['rejected', id],
    );

    return this.findOne(id);
  }

  async inactive(id: number) {
    await this.db.query<ResultSetHeader>(
      'UPDATE customers SET status = ? WHERE id = ?',
      ['inactive', id],
    );

    return this.findOne(id);
  }
`,
    extraControllerMethods: (serviceVar) => `
  @Patch(':id/approve')
  approve(@Param('id', ParseIntPipe) id: number) {
    return this.${serviceVar}.approve(id);
  }

  @Patch(':id/reject')
  reject(@Param('id', ParseIntPipe) id: number) {
    return this.${serviceVar}.reject(id);
  }

  @Patch(':id/inactive')
  inactive(@Param('id', ParseIntPipe) id: number) {
    return this.${serviceVar}.inactive(id);
  }
`,
  },
  {
    name: 'staffs',
    route: 'staffs',
    slug: 'staff',
    table: 'staffs',
    fromClause: 'staffs',
    columns: [
      { name: 'id', kind: 'number' },
      { name: 'name' },
      { name: 'surname' },
      { name: 'email' },
      { name: 'phone' },
      { name: 'password_hash' },
      { name: 'status' },
      { name: 'created_at', kind: 'date' },
      { name: 'updated_at', kind: 'date' },
    ],
    interfaceFields: [
      { name: 'id', kind: 'number' },
      { name: 'name' },
      { name: 'surname' },
      { name: 'email' },
      { name: 'phone' },
      { name: 'password_hash' },
      { name: 'status' },
      { name: 'created_at', kind: 'date' },
      { name: 'updated_at', kind: 'date' },
    ],
    selectFields: [
      'staffs.id',
      'staffs.name',
      'staffs.surname',
      'staffs.email',
      'staffs.phone',
      'staffs.password_hash',
      'staffs.status',
      'staffs.created_at',
      'staffs.updated_at',
    ],
    dtoFields: [
      { name: 'name' },
      { name: 'surname' },
      { name: 'email' },
      { name: 'phone' },
      { name: 'password_hash' },
      { name: 'status', optional: true },
    ],
    insertFields: [
      { name: 'name', column: 'name' },
      { name: 'surname', column: 'surname' },
      { name: 'email', column: 'email' },
      { name: 'phone', column: 'phone' },
      { name: 'password_hash', column: 'password_hash' },
      { name: 'status', column: 'status', createValue: "dto.status ?? 'active'" },
    ],
    mutableFields: [
      { name: 'name', column: 'name' },
      { name: 'surname', column: 'surname' },
      { name: 'email', column: 'email' },
      { name: 'phone', column: 'phone' },
      { name: 'password_hash', column: 'password_hash' },
      { name: 'status', column: 'status' },
    ],
    extraMethods: () => `
  async inactive(id: number) {
    await this.db.query<ResultSetHeader>(
      'UPDATE staffs SET status = ? WHERE id = ?',
      ['inactive', id],
    );

    return this.findOne(id);
  }

  async active(id: number) {
    await this.db.query<ResultSetHeader>(
      'UPDATE staffs SET status = ? WHERE id = ?',
      ['active', id],
    );

    return this.findOne(id);
  }
`,
    extraControllerMethods: (serviceVar) => `
  @Patch(':id/inactive')
  inactive(@Param('id', ParseIntPipe) id: number) {
    return this.${serviceVar}.inactive(id);
  }

  @Patch(':id/active')
  active(@Param('id', ParseIntPipe) id: number) {
    return this.${serviceVar}.active(id);
  }
`,
  },
  {
    name: 'teams',
    route: 'teams',
    slug: 'team',
    table: 'teams',
    fromClause: 'teams',
    columns: [
      { name: 'id', kind: 'number' },
      { name: 'name' },
      { name: 'status' },
      { name: 'created_at', kind: 'date' },
      { name: 'updated_at', kind: 'date' },
    ],
    interfaceFields: [
      { name: 'id', kind: 'number' },
      { name: 'name' },
      { name: 'status' },
      { name: 'created_at', kind: 'date' },
      { name: 'updated_at', kind: 'date' },
    ],
    selectFields: [
      'teams.id',
      'teams.name',
      'teams.status',
      'teams.created_at',
      'teams.updated_at',
    ],
    dtoFields: [{ name: 'name' }, { name: 'status', optional: true }],
    insertFields: [
      { name: 'name', column: 'name' },
      { name: 'status', column: 'status', createValue: "dto.status ?? 'active'" },
    ],
    mutableFields: [
      { name: 'name', column: 'name' },
      { name: 'status', column: 'status' },
    ],
  },
  {
    name: 'roles',
    route: 'roles',
    slug: 'role',
    table: 'roles',
    fromClause: 'roles',
    columns: [
      { name: 'id', kind: 'number' },
      { name: 'name' },
      { name: 'created_at', kind: 'date' },
    ],
    interfaceFields: [
      { name: 'id', kind: 'number' },
      { name: 'name' },
      { name: 'created_at', kind: 'date' },
    ],
    selectFields: ['roles.id', 'roles.name', 'roles.created_at'],
    dtoFields: [{ name: 'name' }],
    insertFields: [{ name: 'name', column: 'name' }],
    mutableFields: [{ name: 'name', column: 'name' }],
  },
  {
    name: 'staff_team_roles',
    route: 'staff-team-roles',
    slug: 'staff-team-role',
    table: 'staff_team_roles',
    fromClause: `staff_team_roles
      LEFT JOIN staffs ON staffs.id = staff_team_roles.staff_id
      LEFT JOIN teams ON teams.id = staff_team_roles.team_id
      LEFT JOIN roles ON roles.id = staff_team_roles.role_id`,
    columns: [
      { name: 'id', kind: 'number' },
      { name: 'staff_id', kind: 'number' },
      { name: 'team_id', kind: 'number' },
      { name: 'role_id', kind: 'number' },
      { name: 'created_at', kind: 'date' },
    ],
    interfaceFields: [
      { name: 'id', kind: 'number' },
      { name: 'staff_id', kind: 'number' },
      { name: 'staff_name' },
      { name: 'team_id', kind: 'number' },
      { name: 'team_name' },
      { name: 'role_id', kind: 'number' },
      { name: 'role_name' },
      { name: 'created_at', kind: 'date' },
    ],
    selectFields: [
      'staff_team_roles.id',
      'staff_team_roles.staff_id',
      "CONCAT(staffs.name, ' ', staffs.surname) AS staff_name",
      'staff_team_roles.team_id',
      'teams.name AS team_name',
      'staff_team_roles.role_id',
      'roles.name AS role_name',
      'staff_team_roles.created_at',
    ],
    dtoFields: [
      { name: 'staff_id', kind: 'number' },
      { name: 'team_id', kind: 'number' },
      { name: 'role_id', kind: 'number' },
    ],
    insertFields: [
      { name: 'staff_id', column: 'staff_id' },
      { name: 'team_id', column: 'team_id' },
      { name: 'role_id', column: 'role_id' },
    ],
    mutableFields: [
      { name: 'staff_id', column: 'staff_id' },
      { name: 'team_id', column: 'team_id' },
      { name: 'role_id', column: 'role_id' },
    ],
    idWhere: 'staff_team_roles.id = ?',
  },
  {
    name: 'organizations',
    route: 'organizations',
    slug: 'organization',
    table: 'organizations',
    fromClause: 'organizations',
    columns: [
      { name: 'id', kind: 'number' },
      { name: 'name' },
      { name: 'type' },
      { name: 'status' },
      { name: 'created_at', kind: 'date' },
      { name: 'updated_at', kind: 'date' },
    ],
    interfaceFields: [
      { name: 'id', kind: 'number' },
      { name: 'name' },
      { name: 'type' },
      { name: 'status' },
      { name: 'created_at', kind: 'date' },
      { name: 'updated_at', kind: 'date' },
    ],
    selectFields: [
      'organizations.id',
      'organizations.name',
      'organizations.type',
      'organizations.status',
      'organizations.created_at',
      'organizations.updated_at',
    ],
    dtoFields: [
      { name: 'name' },
      { name: 'type' },
      { name: 'status', optional: true },
    ],
    insertFields: [
      { name: 'name', column: 'name' },
      { name: 'type', column: 'type' },
      { name: 'status', column: 'status', createValue: "dto.status ?? 'active'" },
    ],
    mutableFields: [
      { name: 'name', column: 'name' },
      { name: 'type', column: 'type' },
      { name: 'status', column: 'status' },
    ],
  },
  {
    name: 'systems',
    route: 'systems',
    slug: 'system',
    table: 'systems',
    fromClause: `systems
      LEFT JOIN organizations ON organizations.id = systems.organization_id`,
    columns: [
      { name: 'id', kind: 'number' },
      { name: 'organization_id', kind: 'number' },
      { name: 'name' },
      { name: 'status' },
      { name: 'created_at', kind: 'date' },
      { name: 'updated_at', kind: 'date' },
    ],
    interfaceFields: [
      { name: 'id', kind: 'number' },
      { name: 'name' },
      { name: 'organization_id', kind: 'number' },
      { name: 'organization_name' },
      { name: 'status' },
      { name: 'created_at', kind: 'date' },
      { name: 'updated_at', kind: 'date' },
    ],
    selectFields: [
      'systems.id',
      'systems.name',
      'systems.organization_id',
      'organizations.name AS organization_name',
      'systems.status',
      'systems.created_at',
      'systems.updated_at',
    ],
    dtoFields: [
      { name: 'organization_id', kind: 'number' },
      { name: 'name' },
      { name: 'status', optional: true },
    ],
    insertFields: [
      { name: 'organization_id', column: 'organization_id' },
      { name: 'name', column: 'name' },
      { name: 'status', column: 'status', createValue: "dto.status ?? 'active'" },
    ],
    mutableFields: [
      { name: 'organization_id', column: 'organization_id' },
      { name: 'name', column: 'name' },
      { name: 'status', column: 'status' },
    ],
    idWhere: 'systems.id = ?',
  },
  {
    name: 'problem_types',
    route: 'problem-types',
    slug: 'problem-type',
    table: 'problem_types',
    fromClause: 'problem_types',
    columns: [
      { name: 'id', kind: 'number' },
      { name: 'name' },
      { name: 'report_type' },
      { name: 'status' },
      { name: 'created_at', kind: 'date' },
      { name: 'updated_at', kind: 'date' },
    ],
    interfaceFields: [
      { name: 'id', kind: 'number' },
      { name: 'name' },
      { name: 'report_type' },
      { name: 'status' },
      { name: 'created_at', kind: 'date' },
      { name: 'updated_at', kind: 'date' },
    ],
    selectFields: [
      'problem_types.id',
      'problem_types.name',
      'problem_types.report_type',
      'problem_types.status',
      'problem_types.created_at',
      'problem_types.updated_at',
    ],
    dtoFields: [
      { name: 'name' },
      { name: 'report_type', enumValues: ['issue', 'complaint'] },
      { name: 'status', optional: true },
    ],
    insertFields: [
      { name: 'name', column: 'name' },
      { name: 'report_type', column: 'report_type' },
      { name: 'status', column: 'status', createValue: "dto.status ?? 'active'" },
    ],
    mutableFields: [
      { name: 'name', column: 'name' },
      { name: 'report_type', column: 'report_type' },
      { name: 'status', column: 'status' },
    ],
  },
  {
    name: 'reports',
    route: 'reports',
    slug: 'report',
    table: 'reports',
    fromClause: `reports
      LEFT JOIN customers ON customers.id = reports.customer_id
      LEFT JOIN systems ON systems.id = reports.system_id
      LEFT JOIN problem_types ON problem_types.id = reports.problem_type_id`,
    columns: [
      { name: 'id', kind: 'number' },
      { name: 'report_no' },
      { name: 'customer_id', kind: 'number' },
      { name: 'system_id', kind: 'number' },
      { name: 'problem_type_id', kind: 'number' },
      { name: 'title' },
      { name: 'detail' },
      { name: 'status' },
      { name: 'score', kind: 'number', optional: true },
      { name: 'reject_reason', optional: true },
      { name: 'resolve_due_at', optional: true },
      { name: 'closed_at', optional: true },
    ],
    interfaceFields: [
      { name: 'id', kind: 'number' },
      { name: 'report_no' },
      { name: 'customer_name' },
      { name: 'system_name' },
      { name: 'problem_type_name' },
      { name: 'title' },
      { name: 'status' },
      { name: 'score', kind: 'number' },
      { name: 'created_at', kind: 'date' },
      { name: 'closed_at', kind: 'date' },
    ],
    selectFields: [
      'reports.id',
      'reports.report_no',
      "CONCAT(customers.name, ' ', customers.surname) AS customer_name",
      'systems.name AS system_name',
      'problem_types.name AS problem_type_name',
      'reports.title',
      'reports.status',
      'reports.score',
      'reports.created_at',
      'reports.closed_at',
    ],
    dtoFields: [
      { name: 'report_no' },
      { name: 'customer_id', kind: 'number' },
      { name: 'system_id', kind: 'number' },
      { name: 'problem_type_id', kind: 'number' },
      { name: 'title' },
      { name: 'detail' },
      { name: 'status' },
      { name: 'score', kind: 'number', optional: true },
      { name: 'reject_reason', optional: true },
      { name: 'resolve_due_at', optional: true },
      { name: 'closed_at', optional: true },
    ],
    insertFields: [
      { name: 'report_no', column: 'report_no' },
      { name: 'customer_id', column: 'customer_id' },
      { name: 'system_id', column: 'system_id' },
      { name: 'problem_type_id', column: 'problem_type_id' },
      { name: 'title', column: 'title' },
      { name: 'detail', column: 'detail' },
      { name: 'status', column: 'status' },
      { name: 'score', column: 'score' },
      { name: 'reject_reason', column: 'reject_reason' },
      { name: 'resolve_due_at', column: 'resolve_due_at' },
      { name: 'closed_at', column: 'closed_at' },
    ],
    mutableFields: [
      { name: 'report_no', column: 'report_no' },
      { name: 'customer_id', column: 'customer_id' },
      { name: 'system_id', column: 'system_id' },
      { name: 'problem_type_id', column: 'problem_type_id' },
      { name: 'title', column: 'title' },
      { name: 'detail', column: 'detail' },
      { name: 'status', column: 'status' },
      { name: 'score', column: 'score' },
      { name: 'reject_reason', column: 'reject_reason' },
      { name: 'resolve_due_at', column: 'resolve_due_at' },
      { name: 'closed_at', column: 'closed_at' },
    ],
    idWhere: 'reports.id = ?',
  },
  {
    name: 'login_logs',
    route: 'login-logs',
    slug: 'login-log',
    table: 'login_logs',
    fromClause: 'login_logs',
    readOnly: true,
    columns: [
      { name: 'id', kind: 'number' },
      { name: 'user_type' },
      { name: 'user_id', kind: 'number' },
      { name: 'ip_address' },
      { name: 'user_agent' },
      { name: 'login_at', kind: 'date' },
      { name: 'status' },
      { name: 'fail_reason' },
    ],
    interfaceFields: [
      { name: 'id', kind: 'number' },
      { name: 'user_type' },
      { name: 'user_id', kind: 'number' },
      { name: 'ip_address' },
      { name: 'user_agent' },
      { name: 'login_at', kind: 'date' },
      { name: 'status' },
      { name: 'fail_reason' },
    ],
    selectFields: [
      'login_logs.id',
      'login_logs.user_type',
      'login_logs.user_id',
      'login_logs.ip_address',
      'login_logs.user_agent',
      'login_logs.login_at',
      'login_logs.status',
      'login_logs.fail_reason',
    ],
  },
  {
    name: 'tickets',
    route: 'tickets',
    slug: 'ticket',
    table: 'tickets',
    fromClause: `tickets
      LEFT JOIN reports ON reports.id = tickets.report_id
      LEFT JOIN teams ON teams.id = tickets.assigned_team_id
      LEFT JOIN staffs AS assigned_staff ON assigned_staff.id = tickets.assigned_staff_id
      LEFT JOIN staffs AS assigned_by_staff ON assigned_by_staff.id = tickets.assigned_by`,
    columns: [
      { name: 'id', kind: 'number' },
      { name: 'ticket_no' },
      { name: 'report_id', kind: 'number' },
      { name: 'parent_ticket_id', kind: 'number', optional: true },
      { name: 'assigned_team_id', kind: 'number', optional: true },
      { name: 'assigned_staff_id', kind: 'number', optional: true },
      { name: 'assigned_by', kind: 'number', optional: true },
      { name: 'title' },
      { name: 'description' },
      { name: 'status' },
      { name: 'resolved_at', optional: true },
      { name: 'closed_at', optional: true },
    ],
    interfaceFields: [
      { name: 'id', kind: 'number' },
      { name: 'ticket_no' },
      { name: 'report_id', kind: 'number' },
      { name: 'report_no' },
      { name: 'assigned_team_id', kind: 'number' },
      { name: 'assigned_team_name' },
      { name: 'assigned_staff_id', kind: 'number' },
      { name: 'assigned_staff_name' },
      { name: 'assigned_by', kind: 'number' },
      { name: 'assigned_by_name' },
      { name: 'title' },
      { name: 'description' },
      { name: 'status' },
      { name: 'created_at', kind: 'date' },
      { name: 'resolved_at', kind: 'date' },
      { name: 'closed_at', kind: 'date' },
    ],
    selectFields: [
      'tickets.id',
      'tickets.ticket_no',
      'tickets.report_id',
      'reports.report_no',
      'tickets.assigned_team_id',
      'teams.name AS assigned_team_name',
      'tickets.assigned_staff_id',
      "CONCAT(assigned_staff.name, ' ', assigned_staff.surname) AS assigned_staff_name",
      'tickets.assigned_by',
      "CONCAT(assigned_by_staff.name, ' ', assigned_by_staff.surname) AS assigned_by_name",
      'tickets.title',
      'tickets.description',
      'tickets.status',
      'tickets.created_at',
      'tickets.resolved_at',
      'tickets.closed_at',
    ],
    dtoFields: [
      { name: 'ticket_no' },
      { name: 'report_id', kind: 'number' },
      { name: 'parent_ticket_id', kind: 'number', optional: true },
      { name: 'assigned_team_id', kind: 'number', optional: true },
      { name: 'assigned_staff_id', kind: 'number', optional: true },
      { name: 'assigned_by', kind: 'number', optional: true },
      { name: 'title' },
      { name: 'description' },
      { name: 'status' },
      { name: 'resolved_at', optional: true },
      { name: 'closed_at', optional: true },
    ],
    insertFields: [
      { name: 'ticket_no', column: 'ticket_no' },
      { name: 'report_id', column: 'report_id' },
      { name: 'parent_ticket_id', column: 'parent_ticket_id' },
      { name: 'assigned_team_id', column: 'assigned_team_id' },
      { name: 'assigned_staff_id', column: 'assigned_staff_id' },
      { name: 'assigned_by', column: 'assigned_by' },
      { name: 'title', column: 'title' },
      { name: 'description', column: 'description' },
      { name: 'status', column: 'status' },
      { name: 'resolved_at', column: 'resolved_at' },
      { name: 'closed_at', column: 'closed_at' },
    ],
    mutableFields: [
      { name: 'ticket_no', column: 'ticket_no' },
      { name: 'report_id', column: 'report_id' },
      { name: 'parent_ticket_id', column: 'parent_ticket_id' },
      { name: 'assigned_team_id', column: 'assigned_team_id' },
      { name: 'assigned_staff_id', column: 'assigned_staff_id' },
      { name: 'assigned_by', column: 'assigned_by' },
      { name: 'title', column: 'title' },
      { name: 'description', column: 'description' },
      { name: 'status', column: 'status' },
      { name: 'resolved_at', column: 'resolved_at' },
      { name: 'closed_at', column: 'closed_at' },
    ],
    idWhere: 'tickets.id = ?',
  },
  {
    name: 'ticket_assignments',
    route: 'ticket-assignments',
    slug: 'ticket-assignment',
    table: 'ticket_assignments',
    fromClause: 'ticket_assignments',
    columns: [
      { name: 'id', kind: 'number' },
      { name: 'ticket_id', kind: 'number' },
      { name: 'assigned_team_id', kind: 'number', optional: true },
      { name: 'assigned_staff_id', kind: 'number', optional: true },
      { name: 'assigned_by', kind: 'number', optional: true },
      { name: 'note', optional: true },
      { name: 'assigned_at', optional: true },
    ],
    interfaceFields: [
      { name: 'id', kind: 'number' },
      { name: 'ticket_id', kind: 'number' },
      { name: 'assigned_team_id', kind: 'number' },
      { name: 'assigned_staff_id', kind: 'number' },
      { name: 'assigned_by', kind: 'number' },
      { name: 'note' },
      { name: 'assigned_at', kind: 'date' },
    ],
    selectFields: [
      'ticket_assignments.id',
      'ticket_assignments.ticket_id',
      'ticket_assignments.assigned_team_id',
      'ticket_assignments.assigned_staff_id',
      'ticket_assignments.assigned_by',
      'ticket_assignments.note',
      'ticket_assignments.assigned_at',
    ],
    dtoFields: [
      { name: 'ticket_id', kind: 'number' },
      { name: 'assigned_team_id', kind: 'number', optional: true },
      { name: 'assigned_staff_id', kind: 'number', optional: true },
      { name: 'assigned_by', kind: 'number', optional: true },
      { name: 'note', optional: true },
    ],
    insertFields: [
      { name: 'ticket_id', column: 'ticket_id' },
      { name: 'assigned_team_id', column: 'assigned_team_id' },
      { name: 'assigned_staff_id', column: 'assigned_staff_id' },
      { name: 'assigned_by', column: 'assigned_by' },
      { name: 'note', column: 'note' },
    ],
    mutableFields: [
      { name: 'ticket_id', column: 'ticket_id' },
      { name: 'assigned_team_id', column: 'assigned_team_id' },
      { name: 'assigned_staff_id', column: 'assigned_staff_id' },
      { name: 'assigned_by', column: 'assigned_by' },
      { name: 'note', column: 'note' },
    ],
  },
  {
    name: 'ticket_work_logs',
    route: 'ticket-work-logs',
    slug: 'ticket-work-log',
    table: 'ticket_work_logs',
    fromClause: 'ticket_work_logs',
    columns: [
      { name: 'id', kind: 'number' },
      { name: 'ticket_id', kind: 'number' },
      { name: 'staff_id', kind: 'number' },
      { name: 'work_detail' },
      { name: 'work_status' },
      { name: 'created_at', kind: 'date' },
    ],
    interfaceFields: [
      { name: 'id', kind: 'number' },
      { name: 'ticket_id', kind: 'number' },
      { name: 'staff_id', kind: 'number' },
      { name: 'work_detail' },
      { name: 'work_status' },
      { name: 'created_at', kind: 'date' },
    ],
    selectFields: [
      'ticket_work_logs.id',
      'ticket_work_logs.ticket_id',
      'ticket_work_logs.staff_id',
      'ticket_work_logs.work_detail',
      'ticket_work_logs.work_status',
      'ticket_work_logs.created_at',
    ],
    dtoFields: [
      { name: 'ticket_id', kind: 'number' },
      { name: 'staff_id', kind: 'number' },
      { name: 'work_detail' },
      { name: 'work_status' },
    ],
    insertFields: [
      { name: 'ticket_id', column: 'ticket_id' },
      { name: 'staff_id', column: 'staff_id' },
      { name: 'work_detail', column: 'work_detail' },
      { name: 'work_status', column: 'work_status' },
    ],
    mutableFields: [
      { name: 'ticket_id', column: 'ticket_id' },
      { name: 'staff_id', column: 'staff_id' },
      { name: 'work_detail', column: 'work_detail' },
      { name: 'work_status', column: 'work_status' },
    ],
  },
  {
    name: 'ticket_resolution_requests',
    route: 'ticket-resolution-requests',
    slug: 'ticket-resolution-request',
    table: 'ticket_resolution_requests',
    fromClause: 'ticket_resolution_requests',
    columns: [
      { name: 'id', kind: 'number' },
      { name: 'ticket_id', kind: 'number' },
      { name: 'requested_by', kind: 'number' },
      { name: 'summary' },
      { name: 'status' },
      { name: 'reviewed_by', kind: 'number', optional: true },
      { name: 'reviewed_at', optional: true },
      { name: 'reject_reason', optional: true },
      { name: 'created_at', kind: 'date' },
    ],
    interfaceFields: [
      { name: 'id', kind: 'number' },
      { name: 'ticket_id', kind: 'number' },
      { name: 'requested_by', kind: 'number' },
      { name: 'summary' },
      { name: 'status' },
      { name: 'reviewed_by', kind: 'number' },
      { name: 'reviewed_at', kind: 'date' },
      { name: 'reject_reason' },
      { name: 'created_at', kind: 'date' },
    ],
    selectFields: [
      'ticket_resolution_requests.id',
      'ticket_resolution_requests.ticket_id',
      'ticket_resolution_requests.requested_by',
      'ticket_resolution_requests.summary',
      'ticket_resolution_requests.status',
      'ticket_resolution_requests.reviewed_by',
      'ticket_resolution_requests.reviewed_at',
      'ticket_resolution_requests.reject_reason',
      'ticket_resolution_requests.created_at',
    ],
    dtoFields: [
      { name: 'ticket_id', kind: 'number' },
      { name: 'requested_by', kind: 'number' },
      { name: 'summary' },
      { name: 'status' },
      { name: 'reviewed_by', kind: 'number', optional: true },
      { name: 'reviewed_at', optional: true },
      { name: 'reject_reason', optional: true },
    ],
    insertFields: [
      { name: 'ticket_id', column: 'ticket_id' },
      { name: 'requested_by', column: 'requested_by' },
      { name: 'summary', column: 'summary' },
      { name: 'status', column: 'status' },
      { name: 'reviewed_by', column: 'reviewed_by' },
      { name: 'reviewed_at', column: 'reviewed_at' },
      { name: 'reject_reason', column: 'reject_reason' },
    ],
    mutableFields: [
      { name: 'ticket_id', column: 'ticket_id' },
      { name: 'requested_by', column: 'requested_by' },
      { name: 'summary', column: 'summary' },
      { name: 'status', column: 'status' },
      { name: 'reviewed_by', column: 'reviewed_by' },
      { name: 'reviewed_at', column: 'reviewed_at' },
      { name: 'reject_reason', column: 'reject_reason' },
    ],
  },
  {
    name: 'attachments',
    route: 'attachments',
    slug: 'attachment',
    table: 'attachments',
    fromClause: 'attachments',
    columns: [
      { name: 'id', kind: 'number' },
      { name: 'report_id', kind: 'number', optional: true },
      { name: 'ticket_id', kind: 'number', optional: true },
      { name: 'attachment_type' },
      { name: 'original_name' },
      { name: 'file_ext' },
      { name: 'uploaded_at', kind: 'date' },
    ],
    interfaceFields: [
      { name: 'id', kind: 'number' },
      { name: 'report_id', kind: 'number' },
      { name: 'ticket_id', kind: 'number' },
      { name: 'attachment_type' },
      { name: 'original_name' },
      { name: 'file_ext' },
      { name: 'uploaded_at', kind: 'date' },
    ],
    selectFields: [
      'attachments.id',
      'attachments.report_id',
      'attachments.ticket_id',
      'attachments.attachment_type',
      'attachments.original_name',
      'attachments.file_ext',
      'attachments.uploaded_at',
    ],
    dtoFields: [
      { name: 'report_id', kind: 'number', optional: true },
      { name: 'ticket_id', kind: 'number', optional: true },
      { name: 'attachment_type' },
      { name: 'original_name' },
      { name: 'file_ext' },
    ],
    insertFields: [
      { name: 'report_id', column: 'report_id' },
      { name: 'ticket_id', column: 'ticket_id' },
      { name: 'attachment_type', column: 'attachment_type' },
      { name: 'original_name', column: 'original_name' },
      { name: 'file_ext', column: 'file_ext' },
    ],
    mutableFields: [
      { name: 'report_id', column: 'report_id' },
      { name: 'ticket_id', column: 'ticket_id' },
      { name: 'attachment_type', column: 'attachment_type' },
      { name: 'original_name', column: 'original_name' },
      { name: 'file_ext', column: 'file_ext' },
    ],
  },
  {
    name: 'report_status_logs',
    route: 'report-status-logs',
    slug: 'report-status-log',
    table: 'report_status_logs',
    fromClause: 'report_status_logs',
    columns: [
      { name: 'id', kind: 'number' },
      { name: 'report_id', kind: 'number' },
      { name: 'old_status' },
      { name: 'new_status' },
      { name: 'changed_by_type' },
      { name: 'changed_by_id', kind: 'number' },
      { name: 'note', optional: true },
      { name: 'created_at', kind: 'date' },
    ],
    interfaceFields: [
      { name: 'id', kind: 'number' },
      { name: 'report_id', kind: 'number' },
      { name: 'old_status' },
      { name: 'new_status' },
      { name: 'changed_by_type' },
      { name: 'changed_by_id', kind: 'number' },
      { name: 'note' },
      { name: 'created_at', kind: 'date' },
    ],
    selectFields: [
      'report_status_logs.id',
      'report_status_logs.report_id',
      'report_status_logs.old_status',
      'report_status_logs.new_status',
      'report_status_logs.changed_by_type',
      'report_status_logs.changed_by_id',
      'report_status_logs.note',
      'report_status_logs.created_at',
    ],
    dtoFields: [
      { name: 'report_id', kind: 'number' },
      { name: 'old_status' },
      { name: 'new_status' },
      { name: 'changed_by_type' },
      { name: 'changed_by_id', kind: 'number' },
      { name: 'note', optional: true },
    ],
    insertFields: [
      { name: 'report_id', column: 'report_id' },
      { name: 'old_status', column: 'old_status' },
      { name: 'new_status', column: 'new_status' },
      { name: 'changed_by_type', column: 'changed_by_type' },
      { name: 'changed_by_id', column: 'changed_by_id' },
      { name: 'note', column: 'note' },
    ],
    mutableFields: [
      { name: 'report_id', column: 'report_id' },
      { name: 'old_status', column: 'old_status' },
      { name: 'new_status', column: 'new_status' },
      { name: 'changed_by_type', column: 'changed_by_type' },
      { name: 'changed_by_id', column: 'changed_by_id' },
      { name: 'note', column: 'note' },
    ],
  },
  {
    name: 'ticket_status_logs',
    route: 'ticket-status-logs',
    slug: 'ticket-status-log',
    table: 'ticket_status_logs',
    fromClause: 'ticket_status_logs',
    columns: [
      { name: 'id', kind: 'number' },
      { name: 'ticket_id', kind: 'number' },
      { name: 'old_status' },
      { name: 'new_status' },
      { name: 'changed_by', kind: 'number' },
      { name: 'note', optional: true },
      { name: 'created_at', kind: 'date' },
    ],
    interfaceFields: [
      { name: 'id', kind: 'number' },
      { name: 'ticket_id', kind: 'number' },
      { name: 'old_status' },
      { name: 'new_status' },
      { name: 'changed_by', kind: 'number' },
      { name: 'note' },
      { name: 'created_at', kind: 'date' },
    ],
    selectFields: [
      'ticket_status_logs.id',
      'ticket_status_logs.ticket_id',
      'ticket_status_logs.old_status',
      'ticket_status_logs.new_status',
      'ticket_status_logs.changed_by',
      'ticket_status_logs.note',
      'ticket_status_logs.created_at',
    ],
    dtoFields: [
      { name: 'ticket_id', kind: 'number' },
      { name: 'old_status' },
      { name: 'new_status' },
      { name: 'changed_by', kind: 'number' },
      { name: 'note', optional: true },
    ],
    insertFields: [
      { name: 'ticket_id', column: 'ticket_id' },
      { name: 'old_status', column: 'old_status' },
      { name: 'new_status', column: 'new_status' },
      { name: 'changed_by', column: 'changed_by' },
      { name: 'note', column: 'note' },
    ],
    mutableFields: [
      { name: 'ticket_id', column: 'ticket_id' },
      { name: 'old_status', column: 'old_status' },
      { name: 'new_status', column: 'new_status' },
      { name: 'changed_by', column: 'changed_by' },
      { name: 'note', column: 'note' },
    ],
  },
  {
    name: 'report_confirmations',
    route: 'report-confirmations',
    slug: 'report-confirmation',
    table: 'report_confirmations',
    fromClause: 'report_confirmations',
    columns: [
      { name: 'id', kind: 'number' },
      { name: 'report_id', kind: 'number' },
      { name: 'customer_id', kind: 'number' },
      { name: 'result' },
      { name: 'comment', optional: true },
      { name: 'score', kind: 'number', optional: true },
      { name: 'confirmed_at', kind: 'date' },
    ],
    interfaceFields: [
      { name: 'id', kind: 'number' },
      { name: 'report_id', kind: 'number' },
      { name: 'customer_id', kind: 'number' },
      { name: 'result' },
      { name: 'comment' },
      { name: 'score', kind: 'number' },
      { name: 'confirmed_at', kind: 'date' },
    ],
    selectFields: [
      'report_confirmations.id',
      'report_confirmations.report_id',
      'report_confirmations.customer_id',
      'report_confirmations.result',
      'report_confirmations.comment',
      'report_confirmations.score',
      'report_confirmations.confirmed_at',
    ],
    dtoFields: [
      { name: 'report_id', kind: 'number' },
      { name: 'customer_id', kind: 'number' },
      { name: 'result' },
      { name: 'comment', optional: true },
      { name: 'score', kind: 'number', optional: true },
    ],
    insertFields: [
      { name: 'report_id', column: 'report_id' },
      { name: 'customer_id', column: 'customer_id' },
      { name: 'result', column: 'result' },
      { name: 'comment', column: 'comment' },
      { name: 'score', column: 'score' },
    ],
    mutableFields: [
      { name: 'report_id', column: 'report_id' },
      { name: 'customer_id', column: 'customer_id' },
      { name: 'result', column: 'result' },
      { name: 'comment', column: 'comment' },
      { name: 'score', column: 'score' },
    ],
  },
  {
    name: 'screenings',
    route: 'screenings',
    slug: 'screening',
    table: 'screenings',
    fromClause: 'screenings',
    columns: [
      { name: 'id', kind: 'number' },
      { name: 'report_id', kind: 'number' },
      { name: 'screened_by', kind: 'number' },
      { name: 'result' },
      { name: 'note', optional: true },
      { name: 'screened_at', kind: 'date' },
    ],
    interfaceFields: [
      { name: 'id', kind: 'number' },
      { name: 'report_id', kind: 'number' },
      { name: 'screened_by', kind: 'number' },
      { name: 'result' },
      { name: 'note' },
      { name: 'screened_at', kind: 'date' },
    ],
    selectFields: [
      'screenings.id',
      'screenings.report_id',
      'screenings.screened_by',
      'screenings.result',
      'screenings.note',
      'screenings.screened_at',
    ],
    dtoFields: [
      { name: 'report_id', kind: 'number' },
      { name: 'screened_by', kind: 'number' },
      { name: 'result' },
      { name: 'note', optional: true },
    ],
    insertFields: [
      { name: 'report_id', column: 'report_id' },
      { name: 'screened_by', column: 'screened_by' },
      { name: 'result', column: 'result' },
      { name: 'note', column: 'note' },
    ],
    mutableFields: [
      { name: 'report_id', column: 'report_id' },
      { name: 'screened_by', column: 'screened_by' },
      { name: 'result', column: 'result' },
      { name: 'note', column: 'note' },
    ],
  },
];

for (const resource of baseResources) {
  const resourceDir = path.join(srcDir, resource.name);
  write(path.join(resourceDir, `${resource.name}.module.ts`), moduleContent(resource));
  write(
    path.join(resourceDir, `${resource.name}.controller.ts`),
    controllerContent(resource),
  );
  write(path.join(resourceDir, `${resource.name}.service.ts`), serviceContent(resource));
  write(
    path.join(resourceDir, 'interfaces', `${resource.slug}.interface.ts`),
    interfaceContent(resource),
  );
  if (!resource.readOnly) {
    write(
      path.join(resourceDir, 'dto', `create-${resource.slug}.dto.ts`),
      dtoContent(resource, false),
    );
    write(
      path.join(resourceDir, 'dto', `update-${resource.slug}.dto.ts`),
      dtoContent(resource, true),
    );
  }
}

const appImports = baseResources
  .map(
    (resource) =>
      `import { ${pascal(resource.name)}Module } from './${resource.name}/${resource.name}.module';`,
  )
  .join('\n');
const appModules = baseResources.map((resource) => `${pascal(resource.name)}Module`).join(', ');

write(
  path.join(srcDir, 'app.module.ts'),
  `
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
${appImports}

@Module({
  imports: [DatabaseModule, ${appModules}],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
`,
);

write(
  path.join(srcDir, 'main.ts'),
  `
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
`,
);
