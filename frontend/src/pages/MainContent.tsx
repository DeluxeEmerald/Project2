import { Outlet } from "react-router-dom";
import LoggedInName from '../components/LoggedInName';
import TopBar from '../components/TopBar';
const CardPage = () =>
{
    return(
    <div>
        <LoggedInName />
        <TopBar />
        <Outlet />
    </div>
    );
}

export default CardPage;