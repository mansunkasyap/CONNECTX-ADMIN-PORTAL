import { Link } from "react-router-dom"



function Footer() {
    return <footer className="d-flex justify-content-between pe-4 ps-4">
       {/* span>Developed & Maintained by <Link to="https://rohininfotech.com/" target="_blank">Rohin Infotech Pvt Ltd</Link></span> */}
        <Link to="/privacy-policy" className="text-decoration-none">Privacy Policy</Link>
    </footer>
}

export default Footer
