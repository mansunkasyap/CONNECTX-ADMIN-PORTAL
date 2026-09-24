import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt, FaClock } from "react-icons/fa";
import TimeRange from "./TimeRange";

const DutyTimeFilter = ({ onFilter }) => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);

    const applyFilter = () => {
        if (onFilter) {
            onFilter({
                date: selectedDate,
                startTime,
                endTime,
            });
        }
    };

    return (
        <div className="custom-datetime-picker">
            <div className="custom-date-input">
                <FaCalendarAlt className="icon" />
                <DatePicker
                    selected={selectedDate}
                    onChange={setSelectedDate}
                    dateFormat="yyyy/MM/dd"
                    placeholderText="Select Date"
                    className="custom-datepicker"
                />
            </div>
            <div className="time-picker-container">
                <div className="time-input">
                    <FaClock className="icon" />
                    <TimeRange value={startTime} onChange={setStartTime} label="Start Time" />
                </div>
                <div className="time-input">
                    <FaClock className="icon" />
                    <TimeRange value={endTime} onChange={setEndTime} label="End Time" />
                </div>
            </div>
            <div className="text-end">
                <button className="btn btn-danger btn-sm" onClick={applyFilter}>
                    Apply Filter
                </button>
            </div>
        </div>
    );
};

export default DutyTimeFilter;
