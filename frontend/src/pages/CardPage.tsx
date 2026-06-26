import PageTitle from '../components/PageTitle';
import LoggedInName from '../components/LoggenInName';
import CardUI from '../components/CardUI';
const CardPage = () =>
{
    return(
    <div>
        <PageTitle />
        <LoggedInName />
        <CardUI />
    </div>
    );
}

export default CardPage;