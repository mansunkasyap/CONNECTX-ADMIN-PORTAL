import { useEffect, useRef, useState } from "react";
import { Dropdown } from "react-bootstrap";
import { userService } from "../../service/service";
import { Link, useNavigate } from "react-router-dom";
import avatar from "../assets/img/user.png";

// eslint-disable-next-line react/prop-types
function HeaderProfleImage({ profileData }) {
	const [branch, setBranch] = useState(profileData || { profile_pic: "", name: "" });
	const navigate = useNavigate();
	const fileInputRef = useRef(null);

	const handlePdfUpload = async (files) => {
		const file = files.target.files[0];
		if (!file) return;
		const data = new FormData();
		data.append(`file`, file);

		try {
			const result = await userService.uploadImage(
				"/v0/image/upload?folderName=connectx/update_profile_pic",
				data,
			);
			const path = result?.data;
			if (!path) return;
			await userService.post("/api/v0/web/update_profile_pic", { path });
			setBranch((prev) => ({ ...prev, profile_pic: path }));
		} catch (err) {
			console.error(err);
		} finally {
			if (fileInputRef.current) fileInputRef.current.value = "";
		}
	};

	useEffect(() => {
		setBranch(profileData);
	}, [profileData]);

	const handleChoosePic = () => {
		fileInputRef.current?.click();
	};

	const handleLogout = () => {
		localStorage.removeItem("auth");
		localStorage.removeItem("_profile_cache");
		navigate("/login");
		window.location.reload();
	};

	return (
		<>
			<div className="headerRightProfile">
				<Dropdown align="end">
					<Dropdown.Toggle
						as="div"
						id="profile-pic-dropdown"
						className="profilePicUpload"
						style={{ cursor: "pointer" }}
					>
						<img
							src={branch?.profile_pic || avatar}
							className="user_profile"
							alt="User Avatar"
						/>
					</Dropdown.Toggle>
					<Dropdown.Menu>
						<Dropdown.Item onClick={handleChoosePic}>
							Update Profile Picture
						</Dropdown.Item>
						<Dropdown.Item as={Link} to="/my-account">
							View Profile
						</Dropdown.Item>
					</Dropdown.Menu>
				</Dropdown>

				<input
					ref={fileInputRef}
					type="file"
					accept="image/*"
					onChange={handlePdfUpload}
					style={{ display: "none" }}
				/>

				<Dropdown>
					<Dropdown.Toggle
						id="dropdown-basic"
						className="profile-dropdown"
						variant="none"
					>
						<span className="user_name">{branch?.name}</span>
					</Dropdown.Toggle>

					<Dropdown.Menu>
						<Link className="dropdown-item" to="/my-account">
							My Account
						</Link>
						<Dropdown.Item className="dropdown-item" onClick={handleLogout}>
							Logout
						</Dropdown.Item>
					</Dropdown.Menu>
				</Dropdown>
			</div>
		</>
	);
}

export default HeaderProfleImage;
