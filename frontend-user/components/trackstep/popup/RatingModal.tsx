"use client";

import * as React from "react";

import {
  Check,
  Star,
} from "lucide-react";

export type RatingModalProps = {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (
    payload: {
      rating: number;
      comment: string;
    },
  ) => Promise<void>;
};

export default function RatingModal({
  open,
  loading,
  onClose,
  onSubmit,
}: RatingModalProps) {
  const [rating, setRating] =
    React.useState(0);

  const [comment, setComment] =
    React.useState("");

  if (!open) return null;

  async function handleSubmit() {
    await onSubmit({
      rating,
      comment,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4">
      <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-xl">
        <div className="flex flex-col items-center bg-[#3472C8] px-6 py-8 text-white">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#A9CCFF]">
            <Check size={42} />
          </div>

          <h2 className="text-center text-sm font-semibold">
            ปัญหาของคุณได้รับการแก้ไข
          </h2>

          <p className="mt-1 text-center text-xs">
            ช่วยทำแบบประเมินการแก้ไขครั้งนี้
            <br />
            เพื่อพัฒนาบริการให้ดีขึ้น
          </p>
        </div>

        <div className="px-7 py-7">
          <p className="mb-4 text-center text-sm font-medium">
            คุณพึงพอใจมากแค่ไหน
          </p>

          <div className="mb-8 flex justify-center gap-3">
            {[1, 2, 3, 4, 5].map(
              (score) => (
                <button
                  key={score}
                  onClick={() =>
                    setRating(score)
                  }
                  className="rounded-md border p-1"
                >
                  <Star
                    size={22}
                    fill={
                      score <= rating
                        ? "#FACC15"
                        : "none"
                    }
                    className={
                      score <= rating
                        ? "text-yellow-400"
                        : "text-gray-400"
                    }
                  />
                </button>
              ),
            )}
          </div>

          <label className="text-sm font-medium">
            ความคิดเห็นเพิ่มเติม
          </label>

          <textarea
            value={comment}
            onChange={(e) =>
              setComment(
                e.target.value,
              )
            }
            placeholder="พิมพ์ข้อความ"
            className="mt-2 min-h-[120px] w-full border p-3 text-sm outline-none"
          />

          <button
            onClick={handleSubmit}
            disabled={
              loading || rating === 0
            }
            className="mt-8 w-full rounded-lg bg-[#3472C8] py-3 text-white disabled:opacity-50"
          >
            {loading
              ? "กำลังส่ง..."
              : "ส่งคำตอบ"}
          </button>
        </div>
      </div>
    </div>
  );
}