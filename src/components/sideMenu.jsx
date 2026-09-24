import {
	Collapse,
	List,
	ListItemButton,
	ListItemText,
	ListSubheader,
} from "@mui/material";
import { SideBarStyle } from "../assets/constants/style";
import { Link, useLocation } from "react-router-dom";
import { memo, useState } from "react";
import { MdArrowDropDown, MdOutlineArrowDropUp } from "react-icons/md";
import { connectxLogo } from "../utils/images";
import { shallowEqual, useSelector } from "react-redux";
function SideMenu() {
	// const getUser = useSelector((state) => state.getUserRight.data, shallowEqual);
	// const [openSubmenus, setOpenSubmenus] = useState({});
	// const locations = useLocation();

	// const handleClick = (menu) => {
	//   setOpenSubmenus((prevState) => ({
	//     ...prevState,
	//     [menu]: !prevState[menu],
	//   }));
	// };	

	// const isActive = (path) => locations.pathname.startsWith(path);

	// const jsxFunction = () => (
	//   <div>
	//     {getUser?.map((val, ind) =>
	//       val.can_view ? (
	//         <div key={ind}>
	//           <ListItemButton
	//             style={SideBarStyle.MenuItemButtonItem}
	//             onClick={() =>
	//               handleClick(val.module_name.replace(/ /g, "-").toLowerCase())
	//             }
	//             className={
	//               isActive(`/${val.module_name.replace(/ /g, "-").toLowerCase()}`)
	//                 ? "active"
	//                 : ""
	//             }
	//           >
	//             <ListItemText
	//               primaryTypographyProps={SideBarStyle.MenuItemText}
	//               primary={val.module_name}
	//             />
	//             {openSubmenus[
	//               val.module_name.replace(/ /g, "-").toLowerCase()
	//             ] ? (
	//               <MdArrowDropDown />
	//             ) : (
	//               <MdOutlineArrowDropUp />
	//             )}
	//           </ListItemButton>
	//           <Collapse
	//             in={
	//               openSubmenus[
	//                 val.module_name.replace(/ /g, '-').toLowerCase()
	//               ] ||
	//               isActive(`/${val.module_name.replace(/ /g, "-").toLowerCase()}`)
	//             }
	//             component="div"
	//             timeout="auto"
	//             unmountOnExit
	//             style={SideBarStyle.ActiveMenu}
	//           >
	//             <List component="div" style={SideBarStyle.SubmenuList}>
	//               {val.rights.map(
	//                 (subVal, subInd) =>
	//                   subVal.can_view && (
	//                     <ListItemButton
	//                       key={subInd}
	//                       component={Link}
	//                       to={`/${val.module_name
	//                         .replace(/ /g, "-")
	//                         .toLowerCase()}/${subVal.transaction_code
	//                         .replace(/ /g, '-')
	//                         .toLowerCase()}`}
	//                       className={
	//                         isActive(
	//                           `/${val.module_name
	//                             .replace(/ /g, "-")
	//                             .toLowerCase()}/${subVal.transaction_code
	//                             .replace(/ /g, '-')
	//                             .toLowerCase()}`
	//                         )
	//                           ? "active"
	//                           : ""
	//                       }
	//                       style={SideBarStyle.MenuItemButtonItem}
	//                     >
	//                       <ListItemText
	//                         primaryTypographyProps={SideBarStyle.MenuItemText}
	//                         primary={subVal.transaction_code}
	//                       />
	//                     </ListItemButton>
	//                   )
	//               )}
	//             </List>
	//           </Collapse>
	//         </div>
	//       ) : null
	//     )}
	//   </div>
	// );

	const getUser = useSelector((state) => state.getUserRight.data, shallowEqual);
	const [openSubmenus, setOpenSubmenus] = useState({});
	const locations = useLocation();
	const handleClick = (menu) => {
		setOpenSubmenus((prevState) => ({
			...prevState,
			[menu]: !prevState[menu],
		}));
	};

	const isActive = (path) => locations.pathname.startsWith(path);
	const hasVisibleSubmenuItems = (rights) => {
		return rights.some((subVal) => subVal.can_view);
	};

	const jsxFunction = () => (
		<div>
			{getUser?.map((val, ind) => {
				const menuPath = val.module_name.replace(/ /g, "-").toLowerCase();
				const hasRights =
					val.rights &&
					val.rights.length > 0 &&
					hasVisibleSubmenuItems(val.rights);

				if (hasRights) {
					return (
						<div key={ind}>
							<ListItemButton
								style={SideBarStyle.MenuItemButtonItem}
								onClick={() => handleClick(menuPath)}
								className={isActive(`/${menuPath}`) ? "active" : ""}
							>
								<ListItemText
									primaryTypographyProps={SideBarStyle.MenuItemText}
									primary={val.module_name}
								/>
								{openSubmenus[menuPath] ? (
									<MdArrowDropDown />
								) : (
									<MdOutlineArrowDropUp />
								)}
							</ListItemButton>
							<Collapse
								in={openSubmenus[menuPath] || isActive(`/${menuPath}`)}
								component="div"
								timeout="auto"
								unmountOnExit
								style={SideBarStyle.ActiveMenu}
							>
								<List component="div" style={SideBarStyle.SubmenuList}>
									{val.rights
										.filter((subVal) => subVal.can_view)
										.map((subVal, subInd) => {
											const subMenuPath = `${menuPath}/${subVal.transaction_code
												.replace(/ /g, "-")
												.toLowerCase()}`;
											return (
												<ListItemButton
													key={subInd}
													component={Link}
													to={`/${subMenuPath}`}
													className={
														isActive(`/${subMenuPath}`) ? "active" : ""
													}
													style={SideBarStyle.MenuItemButtonItem}
												>
													<ListItemText
														primaryTypographyProps={SideBarStyle.MenuItemText}
														primary={subVal.transaction_code}
													/>
												</ListItemButton>
											);
										})}
								</List>
							</Collapse>
						</div>
					);
				}
				return null;
			})}
		</div>
	);

	return (
		<div className="sidebar">
			<List
				sx={{ width: "100%" }}
				component="nav"
				aria-labelledby="nested-list-subheader"
				subheader={
					<ListSubheader
						style={SideBarStyle.MenuHeader}
						component="div"
						id="nested-list-subheader"
					>
						<div className="logobox">
							<Link to="/home/dashboard">
								<img src={connectxLogo} alt="connectX" />
							</Link>
						</div>
					</ListSubheader>
				}
			>
				<div className="menuwrapper">{jsxFunction()}</div>
			</List>
		</div>
	);
}

export default memo(SideMenu);
