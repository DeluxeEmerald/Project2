import PageTitle from '../components/PageTitle';
import Login from '../components/Login';
const LoginPage = () =>
{
    return(
        <div className='app-shell'>
            <div className='page-frame'>
                <PageTitle />
                <Login />
            </div>
        </div>
    );
};
export default LoginPage;