import React, { useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux';
import { hideRemarksModal } from '../../Redux/Modals';

function GrievanceRemarks() {
    const dispatch = useDispatch();
    const remarksModal = useSelector((state) => state.remarksModal.show);
  
    return (
        <Modal show={remarksModal} size='lg' centered onHide={() => dispatch(hideRemarksModal())}>
            <Modal.Header className='fs-4' closeButton>Remarks</Modal.Header>
            <Modal.Body>
               ---TABLE HERE---
            </Modal.Body>
        </Modal>
    )
}

export default GrievanceRemarks