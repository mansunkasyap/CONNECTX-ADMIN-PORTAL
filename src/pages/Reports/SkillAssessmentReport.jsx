/* eslint-disable react/prop-types */
import { useMemo, useState } from "react";
import { Badge, Button, Modal, Table } from "react-bootstrap";
import { FaCheckCircle, FaTimesCircle, FaEye } from "react-icons/fa";
import MainLayout from "../../components/MainLayout";
import CommonDataGrid from "../../components/CommonDataGrid";
import { AutoCompletedDropdown } from "../../components/AutoCompleteDropdown";
import { userService } from "../../../service/service";

function SkillAssessmentReport() {
	const [updateGrid, setupdateGrid] = useState(0);
	const [filters, setFilters] = useState({
		company: "",
		customer_id: null,
	});
	const [showModal, setShowModal] = useState(false);
	const [detailLoading, setDetailLoading] = useState(false);
	const [detailRows, setDetailRows] = useState([]);
	const [detailGuard, setDetailGuard] = useState({ name: "", emp_code: "" });

	const handleFilterChange = (filterKey, value, filterKeyId, id) => {
		setFilters((prev) => ({
			...prev,
			[filterKey]: value || "",
			[filterKeyId]: id,
		}));
		setupdateGrid((prev) => prev + 1);
	};

	const openDetail = async (guard) => {
		setDetailGuard({
			name: guard.full_name || "",
			emp_code: guard.emp_code || "",
		});
		setShowModal(true);
		setDetailLoading(true);
		setDetailRows([]);
		try {
			const res = await userService.post(
				"/api/v0/web/guard_exam_attempt_detail",
				{
					guard_id: guard.guard_id,
					customer_id: filters.customer_id || null,
				}
			);
			if (res?.data?.valid) setDetailRows(res.data.data || []);
		} catch (err) {
			console.error("Error fetching exam detail:", err);
		} finally {
			setDetailLoading(false);
		}
	};

	const correctCount = detailRows.filter((r) => r.is_correct).length;
	const wrongCount = detailRows.length - correctCount;

	const gridColumns = useMemo(
		() => [
			{
				accessorKey: "id",
				header: "Sl.No.",
				enableColumnFilter: false,
				Cell: ({ row }) => Number(row.id) + 1,
				size: 80,
			},
			{
				accessorKey: "emp_code",
				header: "ID No.",
				enableColumnFilter: false,
				size: 130,
			},
			{
				accessorKey: "full_name",
				header: "Name",
				enableColumnFilter: false,
				size: 200,
			},
			{
				id: "site_name_group",
				Header: () => (
					<div className="tabletopheader">
						<AutoCompletedDropdown
							url={"/api/v0/web/web_customer_dropdown"}
							handleDataChange={(value) =>
								handleFilterChange(
									"company",
									value?.company_name,
									"customer_id",
									value?.customer_id
								)
							}
							valueInput={filters.company}
							objLevel={"company_name"}
						/>
					</div>
				),
				columns: [
					{
						accessorKey: "site_name",
						header: "Site Name",
						enableColumnFilter: false,
						minSize: 280,
						Cell: ({ row }) => {
							const code = row.original.customer_code || "";
							const name = row.original.site_name || "";
							return code ? `${code} - ${name}` : name;
						},
					},
				],
			},
			{
				accessorKey: "maximum_marks",
				header: "Maximum Marks",
				enableColumnFilter: false,
				size: 150,
			},
			{
				accessorKey: "marks_obtained",
				header: "Marks Obtained",
				enableColumnFilter: false,
				size: 150,
			},
			{
				accessorKey: "score_pct",
				header: "Score %",
				enableColumnFilter: false,
				size: 110,
				Cell: ({ row }) => `${row.original.score_pct ?? 0}%`,
			},
			{
				accessorKey: "category",
				header: "Category",
				enableColumnFilter: false,
				size: 130,
			},
			{
				accessorKey: "action",
				header: "Action",
				enableColumnFilter: false,
				enableSorting: false,
				size: 120,
				Cell: ({ row }) => (
					<Button
						size="sm"
						variant="outline-primary"
						className="d-inline-flex align-items-center gap-1"
						onClick={() => openDetail(row.original)}
					>
						<FaEye /> View
					</Button>
				),
			},
		],
		[filters]
	);

	return (
		<MainLayout pageName="Skill Assessment Summary Report" hasAddButton={false}>
			<CommonDataGrid
				url={"/api/v0/web/skill_assessment_summary_report"}
				columns={gridColumns}
				body={filters}
				jsonUpd={updateGrid}
			/>

			<Modal
				show={showModal}
				onHide={() => setShowModal(false)}
				size="lg"
				scrollable
				centered
			>
				<Modal.Header closeButton>
					<Modal.Title className="d-flex flex-column">
						<span>Question Breakdown</span>
						<small className="text-muted fs-6">
							{detailGuard.emp_code} · {detailGuard.name}
						</small>
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{!detailLoading && detailRows.length > 0 && (
						<div className="d-flex gap-2 mb-3">
							<Badge bg="primary" className="p-2">
								Total: {detailRows.length}
							</Badge>
							<Badge bg="success" className="p-2">
								<FaCheckCircle className="me-1" /> Correct: {correctCount}
							</Badge>
							<Badge bg="danger" className="p-2">
								<FaTimesCircle className="me-1" /> Wrong: {wrongCount}
							</Badge>
						</div>
					)}

					{detailLoading ? (
						<div className="text-center py-4 text-muted">Loading...</div>
					) : detailRows.length === 0 ? (
						<div className="text-center py-4 text-muted">
							No question attempts found for this guard in the selected period.
						</div>
					) : (
						<Table hover size="sm" className="mb-0 align-middle">
							<thead className="table-light">
								<tr>
									<th style={{ width: 60 }}>#</th>
									<th>Question</th>
									<th>Correct Answer</th>
									<th>Selected</th>
									<th style={{ width: 90 }} className="text-center">
										Result
									</th>
								</tr>
							</thead>
							<tbody>
								{detailRows.map((r, i) => (
									<tr key={r.attempt_id ?? i}>
										<td>{i + 1}</td>
										<td>{r.question || `Q${r.question_no}`}</td>
										<td className="text-success fw-semibold">
											{r.correct_answer}
										</td>
										<td
											className={
												r.is_correct
													? "text-success"
													: "text-danger fw-semibold"
											}
										>
											{r.selected_option}
										</td>
										<td className="text-center">
											{r.is_correct ? (
												<FaCheckCircle className="text-success fs-5" />
											) : (
												<FaTimesCircle className="text-danger fs-5" />
											)}
										</td>
									</tr>
								))}
							</tbody>
						</Table>
					)}
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={() => setShowModal(false)}>
						Close
					</Button>
				</Modal.Footer>
			</Modal>
		</MainLayout>
	);
}

export default SkillAssessmentReport;
