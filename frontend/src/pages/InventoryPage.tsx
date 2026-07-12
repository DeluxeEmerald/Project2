import LoggedInName from '../components/LoggedInName';
import TopBar from '../components/TopBar';
import Inventory from '../components/Inventory.tsx';
const CardPage = () =>
{
    return(
    <div>
        <LoggedInName />
        <TopBar />
        <Inventory />
    </div>
    );
}

export default CardPage;