"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

interface MonthYearPickerProps {
    date: { month: number; year: number };
    onChange: (date: { month: number; year: number }) => void;
}

export default function MonthYearPicker({ date, onChange }: MonthYearPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [viewYear, setViewYear] = useState(date.year);
    const containerRef = useRef<HTMLDivElement>(null);

    const months = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const handleMonthSelect = (monthIndex: number) => {
        onChange({ month: monthIndex + 1, year: viewYear });
        setIsOpen(false);
    };

    const handleYearChange = (increment: number) => {
        setViewYear(prev => prev + increment);
    };

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-purple-100 shadow-sm hover:shadow-md transition-all text-purple-700 font-medium"
            >
                <Calendar size={18} />
                <span>{months[date.month - 1]} {date.year}</span>
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 p-4 bg-white rounded-xl shadow-xl border border-gray-100 z-50 w-72 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() => handleYearChange(-1)}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <ChevronLeft size={20} className="text-muted" />
                        </button>
                        <span className="font-bold text-gray-800 text-lg">{viewYear}</span>
                        <button
                            onClick={() => handleYearChange(1)}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <ChevronRight size={20} className="text-muted" />
                        </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        {months.map((month, index) => {
                            const isSelected = date.month === index + 1 && date.year === viewYear;
                            return (
                                <button
                                    key={month}
                                    onClick={() => handleMonthSelect(index)}
                                    className={`
                                        py-2 px-1 text-sm rounded-lg transition-all
                                        ${isSelected
                                            ? "bg-purple-600 text-white font-medium shadow-md shadow-purple-200"
                                            : "hover:bg-purple-50 text-gray-600 hover:text-purple-700"
                                        }
                                    `}
                                >
                                    {month.substring(0, 3)}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
