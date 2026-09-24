import MainLayout from "./MainLayout";

export default function NotFound() {
	return (
		<MainLayout pageName="404 - Not Found" hasAddButton={false}>
			<div style={{ textAlign: "center", marginTop: "50px" }}>
				<h1>404</h1>
				<h2>Page Not Found</h2>
				<p>The page you are looking for does not exist.</p>
			</div>
		</MainLayout>
	);
}
