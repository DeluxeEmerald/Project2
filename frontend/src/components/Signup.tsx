import {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { buildPath} from './Path';

function Signup(){
    const [errors, setErrors] = useState<string[]>([]);
    const [message,setMessage] = useState('');
    const navigate = useNavigate();

    function getInputValue(id: string): string {
        return (document.getElementById(id) as HTMLInputElement | null)?.value || '';
    }

    function toLogin(){
        window.location.href = '/';
    }

    function validatePawssword(){
        const password = getInputValue('loginPassword');
        const email = getInputValue('email');
        const firstName = getInputValue('firstName');
        const lastName = getInputValue('lastName');
        const minLength = 8;
        const upperCase = /[A-Z]/;
        const specialCharacters = /[!@#$%^&*(),.?":{}|<>_\-+=[\];'~`]/g;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        const errors: string[] = [];

        if (firstName.length < 2){
            errors.push("Please enter a valid first name");
        }

        if (lastName.length < 2){
            errors.push("Please enter a valid last name");
        }

        if (!emailRegex.test(email)){
            errors.push("Please enter a valid email.")
        } 

        if (password.length < minLength){
            errors.push("Password must be at least 8 characters long.");
        }

        if (!upperCase.test(password)){
            errors.push("Password must contain at least 1 uppercase letter.")
        }
        
        const specialCharMatches = password.match(specialCharacters) || [];
        if (specialCharMatches.length < 2) {
            errors.push("Password must contain at least 2 special characters.");
        }

        setErrors(errors);
        return errors.length === 0;
    }

    async function submitSignUp(){
        const validPassword = validatePawssword();

        if (validPassword){
            const loginName = `${getInputValue('firstName')} ${getInputValue('lastName')}`;
            const password = getInputValue('loginPassword');
            const email = getInputValue('email');

            var obj = {name:loginName, password:password, email: email};
            var js = JSON.stringify(obj);
                    
            try
            {
                const response = await fetch(buildPath('api/register'),
                {method:'POST',body:js,headers:{'Content-Type':
                'application/json'}});
                        
                var res = JSON.parse(await response.text());
                        
                if( res.error && res.error.length > 0 )
                {
                    setMessage(res.error);
                }
                else
                {
                    console.log("Success");
                    navigate("/confirm");
                }
            }
            catch(error:any)
            {
                let err = error.toString();
                setMessage(err);
                return;
            }
        } 
    }

    return(
        <section className='auth-layout'>
            <div className='hero-panel'>
                <span className='hero-kicker'>Create Account</span>
                <h2 className='hero-heading'>Start building your collection hub.</h2>
                <p className='hero-copy'>
                    Register once, verify your email, and keep packs, inventory, and decks tied to one account with clearer entry rules.
                </p>
                <div className='hero-stats'>
                    <div className='hero-stat'>
                        <strong>Secure</strong>
                        <span>Validation rules are surfaced before submission.</span>
                    </div>
                    <div className='hero-stat'>
                        <strong>Organized</strong>
                        <span>Your account becomes the base for every card action.</span>
                    </div>
                    <div className='hero-stat'>
                        <strong>Ready</strong>
                        <span>Email verification keeps the flow predictable.</span>
                    </div>
                </div>
            </div>

            <div id="loginDiv" className='auth-card stack-lg'>
                <div>
                    <h2 className='auth-title'>Create your account</h2>
                    <p className='auth-copy'>All required fields are marked and validated before registration.</p>
                </div>

                <div className='auth-form'>
                    <label>
                        <span className='field-label'>First name</span>
                        <input type="text" id="firstName" placeholder="First Name" className='text-input'/>
                    </label>
                    <label>
                        <span className='field-label'>Last name</span>
                        <input type="text" id="lastName" placeholder="Last Name" className='text-input'/>
                    </label>
                    <label>
                        <span className='field-label'>Email</span>
                        <input type="text" id="email" placeholder="Email" className='text-input'/>
                    </label>
                    <label>
                        <span className='field-label'>Password</span>
                        <input type="password" id="loginPassword" placeholder="Password" className='text-input' />
                    </label>
                    <input type="submit" id="loginButton" className="primary-button" value = "Create Account"
                        onClick={()=>submitSignUp()} />
                    <p className='text-black'>Already have an account? <button onClick={toLogin}
                        className='inline-button'>Back to Login</button></p>
                    {message && <span id="loginResult" className="auth-message">{message}</span>}
                    {errors.length > 0 && <div className='error-list'>
                        {errors.map((err, index) => 
                            (<p key = {index}>{err}</p>))}
                    </div>}
                </div>
            </div>
        </section>
    );
};
export default Signup;