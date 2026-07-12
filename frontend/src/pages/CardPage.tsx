import LoggedInName from '../components/LoggenInName';
import TopBar from '../components/TopBar';
import CardUI from '../components/CardUI';
const CardPage = () =>
{
    return(
    <div>
        <LoggedInName />
        <TopBar />
        <CardUI />
    </div>
    );
}

export default CardPage;