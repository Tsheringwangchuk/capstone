import { showAlert } from "./alert.js";

const postingRegisterDetails = async (register) => {
    try {
        const res = await axios({
            method: 'POST',
            url: 'http://localhost:4001/api/v1/registrationDetails/registerDetails',
            data: register
        });

        if (res.data.status === 'success') {
            showAlert('success', 'Successfully Registered Your Employee', '#registerModal .modal-body');
            document.querySelector('.registerForm').reset();
        }
    } catch (err) {
        const message =
            typeof err.response !== 'undefined'
                ? err.response.data.message
                : err.message;
        showAlert('error', message, '#registerModal .modal-body');
    }
};

document.querySelector('.registerForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const fullName = document.getElementById('fullName').value;
    const CID = document.getElementById('cid').value;
    const DOB = document.getElementById('dob').value;
    const employerName = document.getElementById('employerName').value;

    const register = {
        employeename: fullName,
        mycid: CID,
        date: DOB,
        employername: employerName,
    };

    postingRegisterDetails(register);
});
