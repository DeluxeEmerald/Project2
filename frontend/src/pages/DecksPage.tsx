import LoggedInName from '../components/LoggedInName';
import TopBar from '../components/TopBar';
import Decks from '../components/Decks';
const CardPage = () =>
{
    return(
    <div>
        <LoggedInName />
        <TopBar />
        <Decks />
    </div>
    );
}

export default CardPage;