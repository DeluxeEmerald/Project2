import {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { buildPath} from './Path';

function Signup(){
    const [errors, setErrors] = useState([] as String[]);
    const [message,setMessage] = useState('');
    const navigate = useNavigate();

    function toLogin(){
        window.location.href = '/';
    }

    function validatePawssword(){
        const password = (document.getElementById("loginPassword") as HTMLInputElement).value || '';
        const email = (document.getElementById("email") as HTMLInputElement).value || '';
        const firstName = (document.getElementById("firstName") as HTMLInputElement).value || '';
        const lastName = (document.getElementById("lastName") as HTMLInputElement).value || '';
        const minLength = 8;
        const upperCase = /[A-Z]/;
        const specialCharacters = /[!@#$%^&*(),.?":{}|<>_\-+=[\];'~`]/g;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        const errors = [];

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
            const loginName = (document.getElementById("firstName") as HTMLInputElement).value +" "+ (document.getElementById("lastName") as HTMLInputElement).value;
            const password = (document.getElementById("loginPassword") as HTMLInputElement).value || '';
            const email = (document.getElementById("email") as HTMLInputElement).value || '';

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
    );
};
export default Signup;