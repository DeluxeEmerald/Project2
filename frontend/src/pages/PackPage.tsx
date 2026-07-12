import LoggedInName from '../components/LoggedInName';
import TopBar from '../components/TopBar';
import Packs from '../components/Packs';
const CardPage = () =>
{
    return(
    <div>
        <LoggedInName />
        <TopBar />
        <Packs />
    </div>
    );
}

export default CardPage;