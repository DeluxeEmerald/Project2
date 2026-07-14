// import PageTitle from '../components/PageTitle';
import Inventory from '../components/Inventory.tsx';
import LoggedInName from '../components/LoggedInName.tsx';
import TopBar from '../components/TopBar.tsx';
const InventoryPage = () =>
{
    return(
    <div>
        <LoggedInName />
        <TopBar />
        <Inventory />
    </div>
    );
}

export default InventoryPage;