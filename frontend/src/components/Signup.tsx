import {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { buildPath} from './Path';

function Signup(){
<<<<<<< HEAD
    const [errors, setErrors] = useState<string[]>([]);
=======
    const [errors, setErrors] = useState([] as String[]);
>>>>>>> 04be01e36cc669315e7b28f2bb791b68b4845e9c
    const [message,setMessage] = useState('');
    const navigate = useNavigate();

    function getInputValue(id: string): string {
        return (document.getElementById(id) as HTMLInputElement | null)?.value || '';
    }

    function toLogin(){
        window.location.href = '/';
    }

    function validatePawssword(){
<<<<<<< HEAD
        const password = getInputValue('loginPassword');
        const email = getInputValue('email');
        const firstName = getInputValue('firstName');
        const lastName = getInputValue('lastName');
=======
        const password = (document.getElementById("loginPassword") as HTMLInputElement).value || '';
        const email = (document.getElementById("email") as HTMLInputElement).value || '';
        const firstName = (document.getElementById("firstName") as HTMLInputElement).value || '';
        const lastName = (document.getElementById("lastName") as HTMLInputElement).value || '';
>>>>>>> 04be01e36cc669315e7b28f2bb791b68b4845e9c
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
<<<<<<< HEAD
            const loginName = `${getInputValue('firstName')} ${getInputValue('lastName')}`;
            const password = getInputValue('loginPassword');
            const email = getInputValue('email');
=======
            const loginName = (document.getElementById("firstName") as HTMLInputElement).value +" "+ (document.getElementById("lastName") as HTMLInputElement).value;
            const password = (document.getElementById("loginPassword") as HTMLInputElement).value || '';
            const email = (document.getElementById("email") as HTMLInputElement).value || '';
>>>>>>> 04be01e36cc669315e7b28f2bb791b68b4845e9c

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
<<<<<<< HEAD
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
=======
        <div id="loginDiv" className='mt-40 flex flex-col items-center rounded-2xl p-8 max-w-m h-full gap-4'>
        <span id="inner-title" className="font-bold underline text-marble">PLEASE LOG IN</span><br />
        <span id="inner-title" className="font-bold text-marble">Required Fields are 
            <p className="text-magic">Marked*</p></span><br />
        <div className='flex items-center gap-2 text-magic'>
        <p className='w-32'>First Name*:</p> <input type="text" id="firstName" placeholder="First Name"
        className='bg-white'/>
        </div>
        <div className='flex items-center gap-2 text-magic'>
        <p className='w-32'>Last Name*:</p> <input type="text" id="lastName" placeholder="Last Name"
        className='bg-white'/>
        </div>
        <div className='flex items-center gap-2 text-magic'>
        <p className='w-32'>Email*:</p> <input type="text" id="email" placeholder="Email"
        className='bg-white'/>
        </div>
        <div className='flex items-center gap-2 text-magic'>
        <p className='w-32'>Password*:</p> <input type="password" id="loginPassword" placeholder="Password" className='bg-white' />
        </div>
        <input type="submit" id="loginButton" className="bg-main shadow-lg text-white shadow-main/50 rounded-lg w-80 
            hover:bg-wood hover:text-black cursor-pointer" value = "Do It"
            onClick={()=>submitSignUp()} />
        <p className='text-black'>Already have an account? <button onClick={toLogin}
            className='text-magic underline hover:cursor-pointer'>Back to Login</button></p>
        <span id="loginResult" className="text-marble">
            {message}
            {errors.map((err, index) => 
                (<p key = {index}>{err}</p>))}</span>
        </div>
>>>>>>> 04be01e36cc669315e7b28f2bb791b68b4845e9c
    );
};
export default Signup;