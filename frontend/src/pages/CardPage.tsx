// import PageTitle from '../components/PageTitle';
import LoggedInName from '../components/LoggenInName.tsx';
import TopBar from '../components/TopBar.tsx';
import CardUI from '../components/CardUI.tsx';
const CardPage = () =>
{
    return(
    <div>
        {/* <PageTitle /> */}
        <LoggedInName />
        <TopBar />
        <CardUI />
    </div>
    );
}

export default CardPage;