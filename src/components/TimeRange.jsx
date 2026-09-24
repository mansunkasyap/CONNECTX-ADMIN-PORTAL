import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

const TimeRange = ({ value, onChange, label, minTime, maxTime, disable }) => {
  return (
    <div className="d-flex align-items-center gap-2 timepicker_header">
      {label && (
        <label style={{ fontSize: "14px", fontWeight: "bold" }}>{label}</label>
      )}
      <DatePicker
        selected={value ? new Date(value) : null}
        onChange={onChange}
        showTimeSelect
        showTimeSelectOnly
        timeIntervals={15}
        timeCaption="Time"
        dateFormat="HH:mm"
        className="custom-timepicker"
        minTime={
          minTime
            ? new Date(`1970-01-01T${format(minTime, 'HH:mm')}`)
            : new Date('1970-01-01T00:00')
        }
        maxTime={
          maxTime
            ? new Date(`1970-01-01T${format(maxTime, 'HH:mm')}`)
            : new Date('1970-01-01T23:59')
        }
        disabled={disable}
      />

    </div>
  );
};

export default TimeRange;
