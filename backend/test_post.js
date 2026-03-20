const payload = {
    email: 'newuser@test.cl',
    password: '123',
    role: 'CLIENT',
    firstName: 'Juan',
    lastName: 'Perez',
    rut: '1-9',
    phone: '',
    address: '',
    color: '#000',
    healthSystem: '',
    complementaryInsurance: '',
    documentId: '1-9',
    specialty: 'General'
};

fetch('http://localhost:5000/api/data/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
}).then(async res => {
    console.log(res.status);
    console.log(await res.text());
}).catch(e => console.error(e));
