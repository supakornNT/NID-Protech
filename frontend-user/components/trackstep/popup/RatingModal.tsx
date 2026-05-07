"use client";

import * as React from "react";

import { Check, Star, X } from "lucide-react";

export type RatingModalProps = {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    rating: number;
    comment: string;
  }) => Promise<void>;
};

export default function RatingModal({
  open,
  loading,
  onClose,
  onSubmit,
}: RatingModalProps) {
  const [rating, setRating] = React.useState(0);

  const [comment, setComment] = React.useState("");

  if (!open) return null;

  async function handleSubmit() {
    await onSubmit({
      rating,
      comment,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4 py-6">
      <div className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-3xl bg-white shadow-xl">
        {/* HEADER */}
        <div className="relative flex flex-col items-center bg-[#3472C8] px-5 py-7 text-white sm:px-6 sm:py-8">
          {/* CLOSE BUTTON */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#3472C8] transition hover:bg-gray-100"
          >
            <X size={16} />
          </button>

          {/* ICON */}
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#A9CCFF] sm:h-16 sm:w-16">
            <Check
              size={36}
              className="sm:size-[42px]"
            />
          </div>

          {/* TITLE */}
          <h2 className="text-center text-sm font-semibold">
            ปัญหาของคุณได้รับการแก้ไข
          </h2>

          {/* SUBTITLE */}
          <p className="mt-1 text-center text-xs leading-relaxed">
            ช่วยทำแบบประเมินการแก้ไขครั้งนี้
            <br />
            เพื่อพัฒนาบริการให้ดีขึ้น
          </p>
        </div>

        {/* CONTENT */}
        <div className="px-5 py-6 sm:px-7 sm:py-7">
          <p className="mb-4 text-center text-sm font-medium">
            คุณพึงพอใจมากแค่ไหน
          </p>

          {/* STAR RATING */}
          <div className="mb-6 flex justify-center gap-2 sm:mb-8 sm:gap-3">
            {[1, 2, 3, 4, 5].map(
              (score) => (
                <button
                  key={score}
                  type="button"
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

          {/* COMMENT */}
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
            className="mt-2 min-h-[100px] w-full resize-none rounded-md border p-3 text-sm outline-none sm:min-h-[120px]"
          />

          {/* SUBMIT BUTTON */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              loading || rating === 0
            }
            className="mt-6 w-full rounded-lg bg-[#3472C8] py-3 text-white disabled:opacity-50 sm:mt-8"
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