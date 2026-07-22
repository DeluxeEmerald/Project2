import { Outlet } from "react-router-dom";
import LoggedInName from '../components/LoggedInName';
import TopBar from '../components/TopBar';
const CardPage = () =>
{
    return(
    <div className='app-shell'>
        <div className='page-frame'>
            <LoggedInName />
            <TopBar />
            <Outlet />
        </div>
    </div>
    );
}

export default CardPage;