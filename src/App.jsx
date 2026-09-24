import {
	Navigate,
	RouterProvider,
	createBrowserRouter,
} from "react-router-dom";
import Home from "./pages/Home";
import Header from "./components/header";
import SideMenu from "./components/sideMenu";
import Admin from "./pages/Users/Admin";
import BranchManager from "./pages/Users/BranchManager";
import OPSManager from "./pages/Users/OPSManager";
import AreaManager from "./pages/Users/AreaManager";
import Trainer from "./pages/Users/TrainerUser";
import HR from "./pages/Users/HR";
import Branch from "./pages/Branch";
import { ThemeProvider } from "react-bootstrap";
import { createTheme } from "@mui/material";
import AddAdmin from "./pages/Users/Forms/AddAdmin";
import AddAreaManager from "./pages/Users/Forms/AddAreaManager";
import AddHR from "./pages/Users/Forms/AddHR";
import AddTrainer from "./pages/Users/Forms/AddTrainer";
import AddOPSManager from "./pages/Users/Forms/AddOPSManager";
import AddBranchManager from "./pages/Users/Forms/AddBranchManager";
import Login from "./pages/Login/Login";
import AddBranch from "./pages/AddBranch";
import AddCustomerGroup from "./pages/Settings/Forms/AddCustomerGroup";
import Customer from "./pages/Settings/Customer";
import AddCustomer from "./pages/Settings/Forms/AddCustomer";
import Guard from "./pages/Guard/Guard";
import AddGuard from "./pages/Guard/Form/AddGuard";
import GuardDesignation from "./pages/Guard/GuardDesignation";
import AddGuardDesignation from "./pages/Guard/Form/AddGuardDesignation";
import CustomerCheckPoints from "./pages/Settings/CustomerCheckPoints";
import CustomerGroup from "./pages/Settings/CustomerGroup";
import { getAuthUser } from "./components/CommonAuth";
import IssueCat from "./pages/Settings/IssueCat";
import SubIssueCat from "./pages/Settings/SubIssueCat";
import Grievance from "./pages/Settings/Grievance";
import CheckPointPrint from "./pages/Settings/CheckPointPrint";
import IssueDetail from "./pages/Settings/IssueDetail";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Sos from "./pages/SOS/Sos";
import SahyogReason from "./pages/Settings/SahyogReason";
import Sahyog from "./pages/Settings/Sahyog";
import { useEffect, useState } from "react";
import GuardIncident from "./pages/Incident/GuardIncident";
import MyAccount from "./pages/MyAccount";
// import { getToken } from 'firebase/messaging';
// import { messing } from './components/FirebaseNotification';
import Notifications from "./pages/Notifications";
import Attendance from "./pages/Guard/Attendance";
import AttendanceNew from "./pages/Guard/AttendanceNew";
import QRConnect from "./pages/Guard/QRConnect";
import QRScanReports from "./pages/Reports/QrScanReports";
import TrainingSubject from "./pages/Training/TrainingSubject";
import Schedule from "./pages/Training/schedule";
import Trainers from "./pages/Training/Trainers";
import AddTrainers from "./pages/Training/AddTrainers";
import GuardEvent from "./pages/Reports/GuardEvent";
import Addschedule from "./pages/Training/AddSchedule";
import Exam from "./pages/Training/Exam";
import AddExamForm from "./pages/Training/AddExamForm";
import Observation from "./pages/Training/Observation";
import Transaction from "./pages/Users/Transaction/Transaction";
import UserRoles from "./pages/Users/Transaction/UserRoles";
import UserRights from "./pages/Users/Transaction/UserRights";
import CustomerGroupRights from "./pages/Users/Transaction/CustomerGroupRights";
import { useDispatch, useSelector } from "react-redux";
import { showUserRight } from "./Redux/Modals";
import { userService } from "../service/service";
import WbAlert from "./pages/SOS/Wb";
import AddCustomerCheckPoints from "./pages/Settings/Forms/AddCustomerCheckPoints";
import AddCustomerLog from "./pages/Settings/Forms/AddCustomerLog";
import CustomerLog from "./pages/Settings/CustomerLog";
import SurpriseVisitsReport from "./pages/Reports/SurpriseVisitsReport";
import TrainerMonthlyReport from "./pages/Reports/TrainerMonthlyReport";
import GuardMonthlyReport from "./pages/Reports/GuardMonthlyReport";
import SkillAssessmentReport from "./pages/Reports/SkillAssessmentReport";
import Facility from "./pages/facility/Facility";
import TaskSchedule from "./pages/facility/TaskSchedule";
import AddTaskSchedule from "./pages/facility/AddTaskSchedule";
import FrequencyOfService from "./pages/facility/FrequencyOfService";
import AddFrequencyOfService from "./pages/facility/AddFrequencyOfService";
import MaterialRequisition from "./pages/facility/MaterialRequisition";
import { NotificationProvider } from "./context/NotifcationContext";
import Location from "./pages/facility/Location";
import Assets from "./pages/facility/Assets";
import AddAssets from "./pages/facility/AddAssets";
import FacilityCheckPoints from "./pages/facility/FacilityCheckPoints";
import AddFacilityCheckpoints from "./pages/facility/AddFacilityCheckpoints";
import LocationCheckpointPrint from "./pages/facility/LocationCheckpointPrint";
import CorrectiveAction from "./pages/facility/CorrectiveAction";
import FacilityCheckPointReports from "./pages/Reports/FacilityCheckPointReports";
import NotFound from "./components/NotFound";
import MaterialRequisitionReport from "./pages/Reports/MaterialRequisitionReport";
import TrainerClosureReport from "./pages/Reports/TrainerClosureReport";


const theme = createTheme({
	typography: {
		fontSize: 15,
		fontFamily: ["Poppins"],
	},
	components: {
		MuiTextField: {
			styleOverrides: {
				root: {
					backgroundColor: "#fff",
					borderRadius: 8,
				},
			},
		},
	},
});
const routes = createBrowserRouter([
	{
		path: "/",
		element: !getAuthUser() ? <Login /> : <Navigate to="/home/dashboard" />,
	},
	{
		path: "/home/dashboard",
		element: !getAuthUser() ? <Navigate to="/login" /> : <Home />,
	},
	{
		path: "/login",
		element: !getAuthUser() ? <Login /> : <Navigate to="/home/dashboard" />,
	},
	{
		path: "*",
		element: <NotFound />,
	},
	{
		path: "/header",
		element: <Header />,
	},
	{
		path: "/side-menu",
		element: <SideMenu />,
	},
	{
		path: "/privacy-policy",
		element: <PrivacyPolicy />,
	},

	{
		path: "my-account",
		element: <MyAccount />,
	},
	{
		path: "/notifications",
		element: <Notifications />,
	},
	{
		path: "/masters",
		element: null,
		children: [
			{
				path: "branches",
				element: !getAuthUser() ? <Login /> : <Branch />,
			},
			{
				path: "branches/add",
				element: !getAuthUser() ? <Login /> : <AddBranch />,
			},
			{
				path: "guards",
				element: !getAuthUser() ? <Login /> : <Guard />,
			},
			{
				path: "guards/add",
				element: !getAuthUser() ? <Login /> : <AddGuard />,
			},
			{
				path: "guard-designation",
				element: !getAuthUser() ? <Login /> : <GuardDesignation />,
			},
			{
				path: "guard-designation/add",
				element: !getAuthUser() ? <Login /> : <AddGuardDesignation />,
			},

			{
				path: "qr-connect",
				element: !getAuthUser() ? <Login /> : <QRConnect />,
			},
		],
	},
	{
		path: "/customers",
		element: null,
		children: [
			{
				path: "customers",
				element: !getAuthUser() ? <Login /> : <Customer />,
			},
			{
				path: "customer-group",
				element: !getAuthUser() ? <Login /> : <CustomerGroup />,
			},
			{
				path: "customer-group/add",
				element: !getAuthUser() ? <Login /> : <AddCustomerLog />,
			},
			{
				path: "customer/add",
				element: !getAuthUser() ? <Login /> : <AddCustomer />,
			},
			{
				path: "customer-check-points",
				element: !getAuthUser() ? <Login /> : <CustomerCheckPoints />,
			},
			{
				path: "customer-check-points/add",
				element: !getAuthUser() ? <Login /> : <AddCustomerCheckPoints />,
			},
			{
				path: "checkpoint-print/:id",
				element: !getAuthUser() ? <Login /> : <CheckPointPrint />,
			},
			// {
			// 	path: "customerlog/add",
			// 	// path: 'checkpoint-print',
			// 	element: !getAuthUser() ? <Login /> : <AddCustomerLog />,
			// },
			{
				path: "customer-login",
				// path: 'checkpoint-print',
				element: !getAuthUser() ? <Login /> : <CustomerLog />,
			},
		],
	},
	{
		path: "/grievance",
		element: null,
		children: [
			{
				path: "issue-category",
				element: !getAuthUser() ? <Login /> : <IssueCat />,
			},
			{
				path: "issue-subcategory",
				element: !getAuthUser() ? <Login /> : <SubIssueCat />,
			},
			{
				path: "issue-details",
				element: !getAuthUser() ? <Login /> : <IssueDetail />,
			},
			{
				path: "grievance",
				element: !getAuthUser() ? <Login /> : <Grievance />,
			},
		],
	},
	{
		path: "/sahyog",
		element: null,
		children: [
			{
				path: "sahyog-reason",
				element: !getAuthUser() ? <Login /> : <SahyogReason />,
			},
			{
				path: "sahyog",
				element: !getAuthUser() ? <Login /> : <Sahyog />,
			},
		],
	},
	{
		path: "/users",
		element: null,
		children: [
			{
				path: "admin",
				element: !getAuthUser() ? <Login /> : <Admin />,
			},
			{
				path: "branch-manager",
				element: !getAuthUser() ? <Login /> : <BranchManager />,
			},
			{
				path: "ops-manager",

				element: !getAuthUser() ? <Login /> : <OPSManager />,
			},
			{
				path: "area-manager",
				element: !getAuthUser() ? <Login /> : <AreaManager />,
			},
			{
				path: "trainer",
				element: !getAuthUser() ? <Login /> : <Trainer />,
			},
			{
				path: "hr",
				element: !getAuthUser() ? <Login /> : <HR />,
			},
			{
				path: "admin/add",
				element: !getAuthUser() ? <Login /> : <AddAdmin />,
			},
			{
				path: "area-manager/add",
				element: !getAuthUser() ? <Login /> : <AddAreaManager />,
			},
			{
				path: "hr/add",
				element: !getAuthUser() ? <Login /> : <AddHR />,
			},
			{
				path: "trainer/add",
				element: !getAuthUser() ? <Login /> : <AddTrainer />,
			},
			{
				path: "ops-manager/add",
				element: !getAuthUser() ? <Login /> : <AddOPSManager />,
			},
			{
				path: "branch-manager/add",
				element: !getAuthUser() ? <Login /> : <AddBranchManager />,
			},
			{
				path: "training-manager",
				element: !getAuthUser() ? <Login /> : <Trainers />,
			},
			{
				path: "training-manager/add",
				element: !getAuthUser() ? <Login /> : <AddTrainers />,
			},
		],
	},
	{
		path: "/incident",
		element: null,
		children: [
			{
				path: "incident",
				element: !getAuthUser() ? <Login /> : <GuardIncident />,
			},
		],
	},
	{
		path: "/reports",
		element: null,
		children: [
			{
				path: "qr-reports",
				element: !getAuthUser() ? <Login /> : <QRScanReports />,
			},
			{
				path: "guard-event-report",
				element: !getAuthUser() ? <Login /> : <GuardEvent />,
			},

			{
				path: "attendance",
				element: !getAuthUser() ? <Login /> : <AttendanceNew />,
			},


			{
				path: "surprise-visits-report",
				element: !getAuthUser() ? <Login /> : <SurpriseVisitsReport />,
			},
			{
				path: "trainer-monthly-report",
				element: !getAuthUser() ? <Login /> : <TrainerMonthlyReport />,
			},
			{
				path: "trainer-closer",
				element: !getAuthUser() ? <Login /> : <TrainerClosureReport />,
			},
			{
				path: "guard-monthly-report",
				element: !getAuthUser() ? <Login /> : <GuardMonthlyReport />,
			},
			{
				path: "skill-assessment-report",
				element: !getAuthUser() ? <Login /> : <SkillAssessmentReport />,
			},
			{
				path: "facility-checkpoint",
				element: !getAuthUser() ? <Login /> : <FacilityCheckPointReports />,
			},
			{
				path: "material-requisition-report",
				element: !getAuthUser() ? <Login /> : <MaterialRequisitionReport />,
			},
		],
	},
	{
		path: "/training",
		element: null,
		children: [
			{
				path: "schedule",
				element: !getAuthUser() ? <Login /> : <Schedule />,
			},
			{
				path: "trainers",
				element: !getAuthUser() ? <Login /> : <Trainers />,
			},
			{
				path: "addTrainers",
				element: !getAuthUser() ? <Login /> : <AddTrainers />,
			},
			{
				path: "schedule/add",
				element: !getAuthUser() ? <Login /> : <Addschedule />,
			},
			{
				path: "training-subject",
				element: !getAuthUser() ? <Login /> : <TrainingSubject />,
			},
			{
				path: "observation",
				element: !getAuthUser() ? <Login /> : <Observation />,
			},
			{
				path: "exam/add",
				element: !getAuthUser() ? <Login /> : <AddExamForm />,
			},
			{
				path: "exam",
				element: !getAuthUser() ? <Login /> : <Exam />,
			},
		],
	},
	{
		path: "/settings",
		element: null,
		children: [
			{
				path: "transaction",
				element: !getAuthUser() ? <Login /> : <Transaction />,
			},
			{
				path: "roles",
				element: !getAuthUser() ? <Login /> : <UserRoles />,
			},
			{
				path: "user-rights",
				element: !getAuthUser() ? <Login /> : <UserRights />,
			},
			{
				path: "customer-group-rights",
				element: !getAuthUser() ? <Login /> : <CustomerGroupRights />,
			},
		],
	},
	{
		path: "/facility",
		element: null,
		children: [
			{
				path: "facility",
				element: !getAuthUser() ? <Login /> : <Facility />,
			},
			{
				path: "task-schedule",
				element: !getAuthUser() ? <Login /> : <TaskSchedule />,
			},
			{
				path: "task-schedule/add",
				element: !getAuthUser() ? <Login /> : <AddTaskSchedule />,
			},
			{
				path: "assets-/-services",
				element: !getAuthUser() ? <Login /> : <Assets />,
			},
			{
				path: "assets-/-services/add",
				element: !getAuthUser() ? <Login /> : <AddAssets />,
			},
			{
				path: "frequency-service",
				element: !getAuthUser() ? <Login /> : <FrequencyOfService />,
			},
			{
				path: "frequency-service/add",
				element: !getAuthUser() ? <Login /> : <AddFrequencyOfService />,
			},
			{
				path: "location",
				element: !getAuthUser() ? <Login /> : <Location />,
			},
			{
				path: "location-print/:id",
				element: !getAuthUser() ? <Login /> : <LocationCheckpointPrint />,
			},
			{
				path: "corrective-action",
				element: !getAuthUser() ? <Login /> : <CorrectiveAction />,
			},
			{
				path: "facility-check-points",
				element: !getAuthUser() ? <Login /> : <FacilityCheckPoints />,
			},
			{
				path: "facility-check-points/add",
				element: !getAuthUser() ? <Login /> : <AddFacilityCheckpoints />,
			},
			{
				path: "material-requisition",
				element: !getAuthUser() ? <Login /> : <MaterialRequisition />,
			},
		],
	},
], {
	// Required for GitHub Pages: app is served from /<repo-name>/, not domain root.
	basename: import.meta.env.BASE_URL,
});
function App() {
	const [alertWb, setalertWb] = useState(false);
	const [alertSos, setalertSos] = useState(false);
	const dispatch = useDispatch();

	const getUser = useSelector((state) => state?.getUserRight.data);
	function hasViewRight(getUser, module_name, transaction_code) {
		if (!getUser || !Array.isArray(getUser)) return false;
		const module = getUser.find((item) => item?.module_name === module_name);
		if (!module || !Array.isArray(module?.rights)) return false;
		const right = module.rights.find(
			(item) => item.transaction_code === transaction_code,
		);
		return right?.can_view === true;
	}
	useEffect(() => {
		if (getAuthUser()) {
			userService
				.get("/api/v0/web/web_user_rights_browse?global=true")
				.then((data) => {
					dispatch(showUserRight(data.data.data));
				})
				.catch((err) => {
					throw new Error(err);
				});
		}
	}, []);
	useEffect(() => {
		if (getUser) {
			setalertWb(hasViewRight(getUser, "Reports", "Wb"));
			setalertSos(hasViewRight(getUser, "Reports", "Sos"));
		}
	}, [getUser]);

	return (
		<ThemeProvider theme={theme}>
			<NotificationProvider>
				<RouterProvider router={routes} />
				{alertWb && <WbAlert />}
				{alertSos && <Sos />}
			</NotificationProvider>
		</ThemeProvider>
	);
}

export default App;