import { useEffect, useMemo, useState } from "react";
import { Col, Container, Row, Table } from "react-bootstrap";
import MainLayout from "../components/MainLayout";
import { AgCharts } from "ag-charts-react";
import { BiFemale, BiMale } from "react-icons/bi";
import {
	FaBuilding,
	FaUserTie,
	FaUsersCog,
	FaUserShield,
	FaExclamationTriangle,
	FaRegFileAlt,
	FaHandsHelping,
} from "react-icons/fa";
import { userService } from "../../service/service";
import { Link } from "react-router-dom";
import { guardGroupImg } from "../utils/images";

const dashboardStyles = `
.dashWrap { padding: 4px 0 40px; }
.dashWrap .kpiGrid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0,1fr));
  gap: 16px;
  margin-bottom: 20px;
}
@media (max-width: 1200px) { .dashWrap .kpiGrid { grid-template-columns: repeat(3,1fr); } }
@media (max-width: 700px)  { .dashWrap .kpiGrid { grid-template-columns: repeat(2,1fr); } }
.dashWrap .kpiCard {
  position: relative;
  border-radius: 16px;
  padding: 18px 20px;
  color: #fff;
  overflow: hidden;
  box-shadow: 0 6px 18px rgba(33, 43, 54, 0.12);
  transition: transform .18s ease, box-shadow .18s ease;
  text-decoration: none;
  display: block;
}
.dashWrap .kpiCard:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 26px rgba(33, 43, 54, 0.18);
  color: #fff;
}
.dashWrap .kpiCard .kpiIcon {
  position: absolute;
  right: 14px;
  top: 14px;
  font-size: 46px;
  opacity: 0.22;
}
.dashWrap .kpiCard .kpiValue {
  font-size: 34px;
  font-weight: 700;
  line-height: 1.1;
  margin: 0;
}
.dashWrap .kpiCard .kpiLabel {
  font-size: 13px;
  font-weight: 500;
  letter-spacing: .4px;
  opacity: .95;
  margin: 6px 0 0;
  text-transform: uppercase;
}
.dashWrap .kpi-blue    { background: linear-gradient(135deg,#d05356,#7a1f21); }
.dashWrap .kpi-indigo  { background: linear-gradient(135deg,#2c3e50,#1c2833); }
.dashWrap .kpi-teal    { background: linear-gradient(135deg,#c0392b,#3d566e); }
.dashWrap .kpi-violet  { background: linear-gradient(135deg,#8e1b1e,#2c3e50); }
.dashWrap .kpi-sunset  { background: linear-gradient(135deg,#e74c3c,#c0392b); }
.dashWrap .sosCard {
  background: linear-gradient(135deg,#d05356,#1c2833);
  color:#fff;
  border-radius: 16px;
  padding: 16px 18px;
  box-shadow: 0 6px 18px rgba(33,43,54,.12);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.dashWrap .sosCard .sosTitle {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  letter-spacing: .4px;
  text-transform: uppercase;
  font-size: 13px;
}
.dashWrap .sosCard .sosStats {
  display: grid;
  grid-template-columns: repeat(3,1fr);
  gap: 8px;
  text-align: center;
}
.dashWrap .sosCard .sosStats > div {
  background: rgba(255,255,255,.18);
  border-radius: 10px;
  padding: 8px 4px;
}
.dashWrap .sosCard .sosStats b { font-size: 20px; display: block; line-height: 1.1; }
.dashWrap .sosCard .sosStats span { font-size: 11px; opacity: .9; }
.dashWrap .sosCard .unreadPulse {
  animation: unreadPulse 1.6s infinite;
}
@keyframes unreadPulse {
  0%,100% { transform: scale(1); }
  50% { transform: scale(1.08); }
}

.dashWrap .panel {
  background: #fff;
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 4px 14px rgba(33,43,54,.08);
  height: 100%;
}
.dashWrap .panelTitle {
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .6px;
  color: #637381;
  margin: 0 0 12px;
}

.dashWrap .guardSection .guardBody {
  display: grid;
  grid-template-columns: 1fr 1.1fr 0.9fr;
  gap: 14px;
  align-items: center;
}
.dashWrap .guardSection .guardHeroImg {
  width: 100%;
  height: 100%;
  max-height: 240px;
  object-fit: cover;
  border-radius: 12px;
  border: 2px solid #f1d8d9;
  box-shadow: 0 4px 12px rgba(208,83,86,0.18);
}
@media (max-width: 991px) {
  .dashWrap .guardSection .guardBody { grid-template-columns: 1fr; }
  .dashWrap .guardSection .guardHeroImg { max-height: 180px; }
}
.dashWrap .chartBox { min-height: 240px; }
.dashWrap .genderPills {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 12px;
}
.dashWrap .genderPill {
  border-radius: 12px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #fff;
  font-weight: 600;
}
.dashWrap .genderPill svg { font-size: 26px; }
.dashWrap .genderPill .val { font-size: 22px; margin-left: auto; font-weight: 700; }
.dashWrap .genderPill.male { background: linear-gradient(135deg,#2c3e50,#4a6073); }
.dashWrap .genderPill.female { background: linear-gradient(135deg,#d05356,#8e1b1e); }

.dashWrap .customerSection .customerBody {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 14px;
  align-items: center;
}
.dashWrap .custStats { display: flex; flex-direction: column; gap: 10px; }
.dashWrap .custPill {
  border-radius: 12px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #fff;
  font-weight: 600;
}
.dashWrap .custPill .val { font-size: 22px; font-weight: 700; }
.dashWrap .custPill.active   { background: linear-gradient(135deg,#d05356,#8e1b1e); }
.dashWrap .custPill.inactive { background: linear-gradient(135deg,#7a8a99,#2c3e50); }

.dashWrap .branchTableWrap {
  max-height: 320px;
  overflow: auto;
  border-radius: 10px;
  border: 1px solid #edf0f3;
}
.dashWrap .branchTableWrap table {
  margin: 0;
  font-size: 13px;
}
.dashWrap .branchTableWrap thead th {
  position: sticky;
  top: 0;
  background: linear-gradient(180deg,#2c3e50,#1c2833);
  color: #fff;
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: .5px;
  font-weight: 600;
  border: none;
}
.dashWrap .branchTableWrap tbody tr:hover { background: #f4f6f8; }
.dashWrap .branchTableWrap tbody td { border-color: #edf0f3; }

.dashWrap .statusBox {
//   background: linear-gradient(135deg,#283949,#1c2833);
  background: #fff;
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 6px 18px rgba(0,0,0,.25);
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.dashWrap .statusHeader {
  display: flex;
  align-items: center;
  gap: 10px;
}
.dashWrap .statusHeader .icn {
  width: 44px; height: 44px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 20px;
}
.dashWrap .statusHeader .icn.griv { background: linear-gradient(135deg,#d05356,#a93234); }
.dashWrap .statusHeader .icn.syg  { background: linear-gradient(135deg,#d05356,#a93234); }
.dashWrap .statusHeader a { color: #000; text-decoration: none; font-weight: 700; font-size: 16px; }
.dashWrap .statusHeader a:hover { color: #505050; }
.dashWrap .statusHeader small { color: #000; font-size: 12px; display: block; }
.dashWrap .chipRow {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(4, minmax(0,1fr));
}
.dashWrap .chipRow.syg { grid-template-columns: repeat(5, minmax(0,1fr)); }
.dashWrap .chip {
  border-radius: 12px;
  padding: 12px 10px;
  text-align: center;
  background: rgba(0,0,0,.25);
  color: #fff;
}
.dashWrap .chip b { font-size: 20px; display: block; line-height: 1.1; color: #fff; }
.dashWrap .chip span { font-size: 11px; text-transform: uppercase; letter-spacing: .4px; color: rgba(255,255,255,.75); font-weight: 600; }
.dashWrap .chip.amber   { background: linear-gradient(135deg,#d05356,#7a1f21); }
.dashWrap .chip.amber b { color: #fff; }
.dashWrap .chip.blue    { background: linear-gradient(135deg,#8e1b1e,#2c3e50); }
.dashWrap .chip.blue b  { color: #fff; }
.dashWrap .chip.green   { background: linear-gradient(135deg,#2c3e50,#1c2833); }
.dashWrap .chip.green b { color: #fff; }
.dashWrap .chip.red     { background: linear-gradient(135deg,#c0392b,#3d566e); }
.dashWrap .chip.red b   { color: #fff; }
.dashWrap .chip.slate   { background: linear-gradient(135deg,#d05356,#2c3e50); }
.dashWrap .chip.slate b { color: #fff; }
`;

const donutBase = {
	type: "donut",
	calloutLabelKey: "asset",
	angleKey: "amount",
	innerRadiusRatio: 0.72,
	fills: ["#d05356", "#c4c9d4"],
	strokes: ["#fff", "#fff"],
	calloutLabel: { enabled: true, fontSize: 11 },
};

export default function Home() {
	const [figureData, setFigureData] = useState({});
	const [branches, setBranches] = useState([]);

	useEffect(() => {
		(async () => {
			try {
				const r = await userService.get("/api/v0/web/get_dashboard_figures");
				if (r?.data?.valid) setFigureData(r.data.data[0] || {});
			} catch (err) {
				console.error("Error fetching Figure data:", err);
			}
		})();
	}, []);

	useEffect(() => {
		(async () => {
			try {
				const r = await userService.get("/api/v0/web/get_branchwise_totals");
				if (r?.data?.valid) setBranches(r.data.data || []);
			} catch (err) {
				console.error("Error fetching Branch data:", err);
			}
		})();
	}, []);

	const totalGuards =
		(figureData.total_active_guards || 0) +
		(figureData.total_non_active_guards || 0);
	const totalCustomers =
		(figureData.total_active_customers || 0) +
		(figureData.total_non_active_customers || 0);

	const guardChartOption = useMemo(
		() => ({
			data: [
				{ asset: "Active", amount: figureData.total_active_guards || 0 },
				{ asset: "Inactive", amount: figureData.total_non_active_guards || 0 },
			],
			title: { text: "Guards", fontSize: 14 },
			series: [
				{
					...donutBase,
					fills: ["#d05356", "#d9e2ec"],
					innerLabels: [
						{ text: "Total Guards", fontWeight: "bold", color: "#637381" },
						{
							text: `${totalGuards}`,
							spacing: 4,
							fontSize: 34,
							color: "#d05356",
							fontWeight: "bold",
						},
					],
					innerCircle: { fill: "#fff5f5" },
				},
			],
		}),
		[figureData, totalGuards],
	);

	const customerChartOption = useMemo(
		() => ({
			data: [
				{ asset: "Active", amount: figureData.total_active_customers || 0 },
				{
					asset: "Inactive",
					amount: figureData.total_non_active_customers || 0,
				},
			],
			title: { text: "Customers", fontSize: 14 },
			series: [
				{
					...donutBase,
					fills: ["#2c3e50", "#d9e2ec"],
					innerLabels: [
						{ text: "Total Customers", fontWeight: "bold", color: "#637381" },
						{
							text: `${totalCustomers}`,
							spacing: 4,
							fontSize: 28,
							color: "#2c3e50",
							fontWeight: "bold",
						},
					],
					innerCircle: { fill: "#f4f6f8" },
				},
			],
		}),
		[figureData, totalCustomers],
	);

	const sosUnread = figureData.sos_unread || 0;

	return (
		<MainLayout isShowing={false} pageName="Home" hasAddButton={false}>
			<style>{dashboardStyles}</style>

			<Container fluid className="dashWrap">
				{/* ── KPI row ────────────────────────────────────────────────── */}
				<div className="kpiGrid">
					<Link
						to={"/users/branch-manager?type=User"}
						className="kpiCard kpi-blue"
					>
						<FaBuilding className="kpiIcon" />
						<p className="kpiValue">{figureData.total_branches ?? 0}</p>
						<p className="kpiLabel">Branches</p>
					</Link>
					<Link
						to={"/users/branch-manager?type=Manager"}
						className="kpiCard kpi-indigo"
					>
						<FaUserTie className="kpiIcon" />
						<p className="kpiValue">{figureData.total_branch_managers ?? 0}</p>
						<p className="kpiLabel">Branch Managers</p>
					</Link>
					<Link to={"/users/ops-manager"} className="kpiCard kpi-teal">
						<FaUsersCog className="kpiIcon" />
						<p className="kpiValue">{figureData.total_ops_managers ?? 0}</p>
						<p className="kpiLabel">Ops Managers</p>
					</Link>
					<Link to={"/users/area-manager"} className="kpiCard kpi-violet">
						<FaUserShield className="kpiIcon" />
						<p className="kpiValue">{figureData.total_area_managers ?? 0}</p>
						<p className="kpiLabel">Area Managers</p>
					</Link>

					<div className="sosCard">
						<div className="sosTitle">
							<FaExclamationTriangle /> SOS Alerts
						</div>
						<div className="sosStats">
							<div>
								<b>{figureData.total_sos ?? 0}</b>
								<span>Total</span>
							</div>
							<div>
								<b>{figureData.sos_read ?? 0}</b>
								<span>Read</span>
							</div>
							<div className={sosUnread > 0 ? "unreadPulse" : undefined}>
								<b>{sosUnread}</b>
								<span>Unread</span>
							</div>
						</div>
					</div>
				</div>

				{/* ── Guards / Customers charts ─────────────────────────────── */}
				<Row className="g-3 mb-3">
					<Col lg={7}>
						<div className="panel guardSection">
							<p className="panelTitle">Guards Overview</p>
							<div className="guardBody">
								<img
									src={guardGroupImg}
									alt="Guards"
									className="guardHeroImg"
								/>
								<div className="chartBox">
									<AgCharts options={guardChartOption} />
								</div>
								<div>
									<div
										className="genderPills"
										style={{ gridTemplateColumns: "1fr" }}
									>
										<div className="genderPill male">
											<BiMale />
											<span>Male</span>
											<span className="val">
												{figureData.total_male_guards ?? 0}
											</span>
										</div>
										<div className="genderPill female">
											<BiFemale />
											<span>Female</span>
											<span className="val">
												{figureData.total_female_guards ?? 0}
											</span>
										</div>
									</div>
									<div
										className="chip slate"
										style={{ marginTop: 12, textAlign: "left", padding: 14 }}
									>
										<b style={{ color: "#fff" }}>
											{figureData.total_active_guards ?? 0}
										</b>
										<span>Active Guards</span>
									</div>
								</div>
							</div>
						</div>
					</Col>
					<Col lg={5}>
						<div className="panel customerSection">
							<p className="panelTitle">Customers Overview</p>
							<div className="customerBody">
								<div className="chartBox">
									<AgCharts options={customerChartOption} />
								</div>
								<div className="custStats">
									<div className="custPill active">
										<span>Active</span>
										<span className="val">
											{figureData.total_active_customers ?? 0}
										</span>
									</div>
									<div className="custPill inactive">
										<span>Inactive</span>
										<span className="val">
											{figureData.total_non_active_customers ?? 0}
										</span>
									</div>
									<div
										className="chip slate"
										style={{ textAlign: "left", padding: 14 }}
									>
										<b style={{ color: "#fff" }}>{totalCustomers}</b>
										<span>Total Customers</span>
									</div>
								</div>
							</div>
						</div>
					</Col>
				</Row>

				{/* ── Branch directory + Status panels ──────────────────────── */}
				<Row className="g-3">
					<Col lg={7}>
						<div className="panel">
							<p className="panelTitle">Branch Directory</p>
							<div className="branchTableWrap">
								<Table hover className="mb-0">
									<thead>
										<tr>
											<th>Branch</th>
											<th>Managers</th>
											<th>Ops</th>
											<th>Area</th>
											<th>Customers</th>
											<th>Guards</th>
											<th>App Using</th>
										</tr>
									</thead>
									<tbody>
										{branches?.length ? (
											branches.map((item, index) => (
												<tr key={(item.r_branch_id ?? index) + "-" + index}>
													<td>
														<strong>{item.branch_name}</strong>
													</td>
													<td>{item.total_branch_managers}</td>
													<td>{item.total_ops_managers}</td>
													<td>{item.total_area_managers}</td>
													<td>{item.total_customers}</td>
													<td>{item.total_guards}</td>
													<td>{item.total_guards_active}</td>
												</tr>
											))
										) : (
											<tr>
												<td colSpan={7} className="text-center text-muted py-4">
													No branch data
												</td>
											</tr>
										)}
									</tbody>
								</Table>
							</div>
						</div>
					</Col>
					<Col lg={5}>
						<div className="d-flex flex-column gap-3 h-100">
							<div className="statusBox">
								<div className="statusHeader">
									<div className="icn griv">
										<FaRegFileAlt />
									</div>
									<div>
										<Link to="/grievance/grievance">Grievances</Link>
										<small>Pending vs resolved status</small>
									</div>
								</div>
								<div className="chipRow">
									<div
										className="chip amber text-white"
										style={{
											background: "linear-gradient(135deg,#d05356,#7a1f21)",
										}}
									>
										<b>{figureData.grievances_pending ?? 0}</b>
										<span className="text-white">Pending</span>
									</div>
									<div
										className="chip blue text-white"
										style={{
											background: "linear-gradient(135deg,#2c3e50,#1c2833)",
										}}
									>
										<b>{figureData.grievances_in_process ?? 0}</b>
										<span className="text-white">In Process</span>
									</div>
									<div
										className="chip green text-white"
										style={{
											background: "linear-gradient(135deg,#d05356,#7a1f21)",
										}}
									>
										<b>{figureData.grievances_complete ?? 0}</b>
										<span className="text-white">Complete</span>
									</div>
									<div
										className="chip slate text-white"
										style={{
											background: "linear-gradient(135deg,#2c3e50,#1c2833)",
										}}
									>
										<b>{figureData.total_grievances ?? 0}</b>
										<span className="text-white">Total</span>
									</div>
								</div>
							</div>

							<div className="statusBox">
								<div className="statusHeader">
									<div className="icn syg">
										<FaHandsHelping />
									</div>
									<div>
										<Link to="/sahyog/sahyog">Sahyog</Link>
										<small>Welfare requests summary</small>
									</div>
								</div>
								<div className="chipRow syg">
									<div
										className="chip amber text-white"
										style={{
											background: "linear-gradient(135deg,#d05356,#7a1f21)",
										}}
									>
										<b>{figureData.sahyog_pending ?? 0}</b>
										<span className="text-white">Pending</span>
									</div>
									<div
										className="chip blue text-white"
										style={{
											background: "linear-gradient(135deg,#2c3e50,#1c2833)",
										}}
									>
										<b>{figureData.sahyog_in_process ?? 0}</b>
										<span className="text-white">In Process</span>
									</div>
									<div
										className="chip green text-white"
										style={{
											background: "linear-gradient(135deg,#d05356,#7a1f21)",
										}}
									>
										<b>{figureData.sahyog_accepted ?? 0}</b>
										<span className="text-white">Approved</span>
									</div>
									<div
										className="chip red text-white"
										style={{
											background: "linear-gradient(135deg,#2c3e50,#1c2833)",
										}}
									>
										<b>{figureData.sahyog_rejected ?? 0}</b>
										<span className="text-white">Rejected</span>
									</div>
									<div
										className="chip slate text-white"
										style={{
											background: "linear-gradient(135deg,#d05356,#7a1f21)",
										}}
									>
										<b>{figureData.total_sahyog ?? 0}</b>
										<span className="text-white">Total</span>
									</div>
								</div>
							</div>
						</div>
					</Col>
				</Row>
			</Container>
		</MainLayout>
	);
}
