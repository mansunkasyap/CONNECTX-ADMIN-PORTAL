/* eslint-disable no-unused-vars */
import { useMemo, useState } from 'react';
import { Badge, Form } from 'react-bootstrap';
import { BsEyeFill, BsPenFill, BsTrash3Fill } from 'react-icons/bs';
import {
    hideModal,
    showModal,
    toggleSpinnerAndDisableButton,
} from '../../../Redux/Modals';
import { userService } from '../../../../service/service';
import DeleteModal from '../../../components/DeleteModal';
import Toast from '../../../components/Toast';
import moment from 'moment';
import { Navigate, useNavigate } from 'react-router-dom';
import { MdOutlineEdit } from 'react-icons/md';
import { FaEye } from 'react-icons/fa';
import MainLayout from '../../../components/MainLayout';
import CommonDataGrid from '../../../components/CommonDataGrid';
import { useDispatch, useSelector } from 'react-redux';

function Transaction() {
    const deleteMessage = useSelector((state) => state.removeModal.message);
    const [updateGrid, setupdateGrid] = useState(0);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [body, setbody] = useState({
        refresh: '',
    });
    const [toast, setToast] = useState({ show: false, type: "success", message: "" });
    const showToast = (type, message) => setToast({ show: true, type, message });
    const hideToast = () => setToast((prev) => ({ ...prev, show: false }));
    const deleteModalData = {
        id: deleteMessage?.user_id,
        name: deleteMessage?.full_name,
    };


    const [disableValue, setdisableValue] = useState({
        transaction_id: '',
        status: false,
    });
    async function handleDelete(id) {
        const obj = {
            user_id: id,
        };
        try {
            const response = await userService.post(
                '/api/v0/web/web_user_admin_delete',
                obj
            );
            if (response.data.valid) {
                showToast("success", "Saved successfully!");
                setbody({
                    ...body,
                    refresh: 2,
                });
                dispatch(toggleSpinnerAndDisableButton(false));
                setTimeout(() => {
                }, 1700);
            } else {
                alert(response.data.message);
            }
        } catch (err) {
            console.error(err);
        }
        dispatch(hideModal());
    }



    const disableCategory = async (row) => {
        try {
            const updatedDisableValue = {
                ...disableValue,
                // is_disabled: !row.original.is_disabled,
                transaction_id: row.original.transaction_id,
                status: row.original.status
            };

            const response = await userService.post(
                '/api/v0/web/web_transaction_update_status',
                updatedDisableValue
            );

            if (response.data.valid) {
                showToast("success", "Saved successfully!");
                setbody({
                    ...body,
                    refresh: 2,
                });
                setTimeout(() => {
                }, 1600);
            } else {
                alert('error');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const gridColumns = useMemo(
        () => [
            {
                accessorKey: 'id',
                header: 'S.No.',
                enableColumnFilter: false,
                Cell: ({ renderedCellValue, row }) => Number(row.id) + 1,
                size: 80,
            },
            {
                accessorKey: 'transaction_code',
                header: 'Transaction Code',
                enableColumnFilter: false,
                size: 150,
            },
            {
                accessorKey: 'transaction_name',
                header: 'Transaction Name',
                enableColumnFilter: false,
                size: 180,
            },
            {
                accessorKey: 'module_name',
                header: 'Module Name',
                enableColumnFilter: false,
                size: 150,
            },
            {
                accessorKey: 'description',
                header: 'Description',
                enableColumnFilter: false,
                size: 240,
            },
            {
                accessorKey: 'is_active',
                header: 'Disable',
                enableColumnFilter: false,
                size: 100,
                Cell: ({ row, renderedCellValue }) => {
                    return (
                        <div className="actionswitch">
                            <Form.Check
                                type="switch"
                                size="sm"
                                variant="danger"
                                defaultChecked={renderedCellValue}
                                onChange={() => disableCategory(row)}
                            />
                        </div>
                    );
                },
            },
        ],
        []
    );

    const handlePreview = (data) => {
        const obj = { ...data };
        obj.p_action = 'update';
        navigate('/users/admin/add', {
            state: {
                id: obj.user_id,
                type: 'preview',
            },
        });
    };

    const handleEdit = (data) => {
        const obj = { ...data };        
        obj.p_action = 'update';
        navigate('/users/admin/add', {
            state: {
                id: obj.user_id,
                type: 'edit',
            },
        });        
    };

    return (
        <MainLayout
            pageName="Transaction"
            hasAddButton={false}
        // linkto={'/users/admin/add'}
        // branchDropdown={true}
        >
            <CommonDataGrid
                url={'/api/v0/web/web_transactions_browse'}
                columns={gridColumns}
                body={body}
                jsonUpd={updateGrid}
            />
            <DeleteModal removeId={handleDelete} data={deleteModalData} />
            <Toast show={toast.show} type={toast.type} message={toast.message} onClose={hideToast} />
        </MainLayout>
    );
}

export default Transaction;
