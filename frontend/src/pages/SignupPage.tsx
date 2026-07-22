import PageTitle from '../components/PageTitle';
import Signup from '../components/Signup';
const SignupPage = () =>
{
    return(
        <div className='app-shell'>
            <div className='page-frame'>
                <PageTitle />
                <Signup />
            </div>
        </div>
    );
};
export default SignupPage;