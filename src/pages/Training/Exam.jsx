/* eslint-disable no-unused-vars */
import { useEffect, useMemo, useState } from 'react';
import MainLayout from '../../components/MainLayout';
import CommonDataGrid from '../../components/CommonDataGrid';
import { Col, Form, Row, Button, Badge, Spinner } from 'react-bootstrap';
import ModalComponent from '../../components/ModalComponent';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import Datetime from 'react-datetime';
import 'react-datepicker/dist/react-datepicker.css';
import { ConnectXDateRange } from '../../components/DateRange';
import {
  Autocomplete,
  FormControl,
  IconButton,
  Input,
  InputLabel,
  Menu,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import {
  hideModal,
  showModal,
  toggleForm,
  toggleSpinnerAndDisableButton,
} from '../../Redux/Modals';
import { userService } from '../../../service/service';
import TimeRange from 'react-time-range';
import DatePicker from 'react-datepicker';
import Datepicker from 'react-datepicker';
import { MdCheck, MdOutlineEdit , MdMoreVert } from "react-icons/md";
import { FaEye } from 'react-icons/fa';
import { BsTrash3Fill } from 'react-icons/bs';
import { CommonController } from '../../components/CommonController';
import DeleteModal from '../../components/DeleteModal';
import { useNavigate } from 'react-router-dom';

function RowActionMenu({ row, onEdit, onPreview, onDelete, onRemarks, canEdit, canView, canDelete }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [openUpward, setOpenUpward] = useState(false);
  const open = Boolean(anchorEl);
  const handleClose = () => setAnchorEl(null);
  const handleOpen = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setOpenUpward(window.innerHeight - rect.bottom < 160);
    setAnchorEl(e.currentTarget);
  };
  return (
    <>
      <IconButton size="small" onClick={handleOpen}>
        <MdMoreVert />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: openUpward ? "top" : "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: openUpward ? "bottom" : "top", horizontal: "right" }}
        slotProps={{ paper: { elevation: 3, sx: { minWidth: 120, borderRadius: 2 } } }}
      >
        {canEdit && <MenuItem onClick={() => { onEdit(row); handleClose(); }} sx={{ gap: 1, fontSize: 14 }}><MdOutlineEdit size={16} /> Edit</MenuItem>}
        {canView && <MenuItem onClick={() => { onPreview(row); handleClose(); }} sx={{ gap: 1, fontSize: 14 }}><FaEye size={14} /> View</MenuItem>}
        {onRemarks && <MenuItem onClick={() => { onRemarks(row); handleClose(); }} sx={{ gap: 1, fontSize: 14 }}><BsChatLeftDotsFill size={14} /> Remarks</MenuItem>}
        {canDelete && <MenuItem onClick={() => { onDelete(row); handleClose(); }} sx={{ gap: 1, fontSize: 14, color: "error.main" }}><BsTrash3Fill size={13} /> Delete</MenuItem>}
      </Menu>
    </>
  );
}

export default function Exam() {
  const addButton = useSelector((state) => state.addFormButton.show);
  const dispatch = useDispatch();
  const [formTitle, setFormTitle] = useState('Add Schedule Reason');

  const date = new Date();
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [updateGrid, setupdateGrid] = useState(0);
  const [start, startRef] = useState(null);
  const [end, endRef] = useState(null);
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    company: '',
    customer_id: null,
    area: '',
    from_time: moment().format('YYYY-MM-DD'),
    to_time: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate() + 1
      }`,
    category_id: null,
  });
  const deleteMessage = useSelector((state) => state.removeModal.message);

  const deleteModalData = {
    id: deleteMessage?.exam_id,
    name: deleteMessage?.exam_no,
  };
  const [body, setbody] = useState({
    refresh: '',
  });


  // start userRights
  const getUser = useSelector((state) => state.getUserRight.data);
  const url = useMemo(() => window.location.pathname.split('/'), []);
  const isUserRight = useMemo(() => {
    if (getUser) {      
      const moduleRights = getUser.find(
        (val) => val.module_name.toLowerCase() === url[1]
      );
      const finalModule = moduleRights?.rights.filter(
        (val) =>
          val.transaction_code.replace(/ /g, '-').toLowerCase() === url[2]
      );
      return finalModule?.length > 0
        ? finalModule[0]
        : {
          can_view: false,
          can_insert: false,
          can_edit: false,
          can_delete: false,
          can_print: false,
        };
    }
  }, [getUser, url]);
  //end UserRights
  async function handleDelete(id) {
    const obj = {
      exam_id: id,    
    };
    try {
      const response = await userService.post(
        '/api/v0/web/web_training_exam_delete',
        obj
      );

      if (response.data.valid) {
        showToast("success", "Saved successfully!");
        setbody({
          ...body,
          refresh: 2,
        });
      }
    } catch (err) {
      console.error('Error occurred while deleting:', err);
    } finally {
      dispatch(hideModal());
      dispatch(toggleSpinnerAndDisableButton(false));
      showToast("success", "Saved successfully!");
      setupdateGrid(updateGrid + 1);
      setTimeout(() => {
      }, 3000);
    }
  }

  const handleFilterChange = (filterKey, value, filterKeyId, id) => {

    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterKey]: value || '',
      [filterKeyId]: id,
    }));
    setupdateGrid((prev) => prev + 1);
  };
  const handleEndTimeChange = (newEndTime) => {
    if (moment(newEndTime).isAfter(startTime)) {
      setEndTime(moment(newEndTime));
    } else {
      alert('End time must be after start time!');
    }
  };

  const handleDateChange = (field, date) => {
    setinputValues({
      ...inputValues,
      [field]: date,
    });
  };
  const spinnerButton = useSelector(
    (state) => state.toggleSpinnerAndDisableButton.show
  );

  const gridColumns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'S.No.',
        enableColumnFilter: false,
        Cell: ({ renderedCellValue, row }) => Number(row.id) + 1,
        size: 90,
      },
      // {
      //   accessorKey: 'date',
      //   header: 'Exam Date',
      //   enableColumnFilter: false,
      //   size: 160,
      // },
      {
        accessorKey: 'date',
        header: 'Exam Date',
        Cell: ({ renderedCellValue }) => {
          if (!renderedCellValue) return <span>-</span>;
          const formattedDate = moment(renderedCellValue).isValid()
            ? moment(renderedCellValue).format('DD-MM-YYYY')
            : '-';
          return <span>{formattedDate}</span>;
        },
        enableColumnFilter: false,
        size: 180,
      },
      {
        accessorKey: 'exam_no',
        header: 'Exam No.',
        enableColumnFilter: false,
        size: 200,
      },
      {
        accessorKey: 'category_name',
        header: 'Category Name',
        enableColumnFilter: false,
        size: 250,
      },
      {
        accessorKey: 'completion_time',
        header: 'Completion Time',
        enableColumnFilter: false,
        size: 160,
      },
      {
        accessorKey: 'created_by',
        header: 'Created by',
        enableColumnFilter: false,
        size: 150,
      },
      {
        accessorKey: 'created_at',
        header: 'Date',
        enableColumnFilter: false,
        size: 190,
        Cell: ({ row }) => {
          const CheckIn = row.original.created_at;
          if (!CheckIn) return 'N/A';
          return (
            <span>
              {moment(CheckIn).format('DD-MM-YYYY (hh:mm A)')}
            </span>
          );
        },
      },
      {
        accessorKey: 'action',
        header: 'Action',
        enableColumnFilter: false,
        size: 100,
                Cell: ({ row }) => (
          <RowActionMenu
          row={row.original}
          onEdit={handleEdit}
          onPreview={handlePreview}
          onDelete={(data) => dispatch(showModal(data))}
          canEdit={isUserRight?.can_edit}
          canView={isUserRight?.can_view}
          canDelete={isUserRight?.can_delete}
          />
        ),
        },
    ],
    [isUserRight]
  );

  const handleEdit = (data) => {
    const obj = { ...data };
    navigate('/training/exam/add', {
      state: {
        id: obj.exam_id,
        type: 'edit',
      },
    });
  };

  const handlePreview = (data) => {
    const obj = { ...data };
    navigate('/training/exam/add', {
      state: {
        id: obj.exam_id,
        type: 'preview',
      },
    });
  };
  const dateFilter = (date) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      from_date: moment(date.startDate || new Date()).format('YYYY-MM-DD'),
      to_date: moment(date.endDate || new Date()).format('YYYY-MM-DD'),
    }));
    setupdateGrid((prev) => prev + 1);
  };
  return (
    <MainLayout
      isShowing={false}
      pageName="Training Exam"
      // hasAddButton={true}
      hasAddButton={isUserRight?.can_insert}
      linkto={'/training/exam/add'}
    >
      <CommonDataGrid
        url={'/api/v0/web/web_training_exam_browse'}
        columns={gridColumns}
        body={filters}
        jsonUpd={updateGrid}
      />
      <DeleteModal removeId={handleDelete} data={deleteModalData} />

      <ModalComponent
        // innerJsx={addFormJsx}
        modalTitle={formTitle}
        hidden={addButton}
      />
    </MainLayout>
  );
}
