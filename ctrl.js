const bcrypt = require("bcrypt");

const createLogin = async (req, res) => {
  try {
    const db = req.app.get("db");
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(401)
        .send("Please enter a valid username and password.");
    }

    const user = await db.users.find({ username });
    if (!user) {
      return res
        .status(401)
        .send(
          "Please enter a valid username or password or you may need to signup"
        );
    }

    const authenticated = await bcrypt.compare(password, user.password);
    if (!authenticated) {
      return res.status(401).send("Please enter a valid username and password");
    }

    req.session.user = user;

    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
};

const createSignup = async (req, res, next) => {
  try {
    const { firstName, lastName, username, password } = req.body;
    const db = req.app.get("db");

    const hash = await bcrypt.hash(password, 10);

    const newUser = await db.employees.insert({
      first_name: firstName,
      last_name: lastName,
      username: username,
      password: hash,
    });

    delete newUser.password;
    res.send(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

const getContacts = async (req, res) => {
  try {
    const db = await req.app.get("db");

    // get all contacts
    const contacts = await db.query(`select * from contacts`);
    res.status(200).send(
      contacts.map((contact) => ({
        id: contact.id,
        firstName: contact.first_name,
        lastName: contact.last_name,
        phone: contact.phone,
        email: contact.email,
        address1: contact.address1,
        address2: contact.address2,
        city: contact.city,
        state: contact.state,
        zip: contact.zip
      }))
    );
  } catch (error) {
    console.log(error);
    res.status(500).send(`async catch: ${error}`);
  }
};

const newContact = async (req, res) => {
  try {
    const db = await req.app.get("db");
    const {
      firstName,
      lastName,
      phone,
      email,
      address1,
      address2,
      city,
      state,
      zip,
    } = req.body;

    const newContact = {
      first_name: firstName,
      last_name: lastName,
      phone: phone,
      email: email,
      address1: address1,
      address2: address2,
      city: city,
      state: state,
      zip: zip,
      created_at: new Date(),
      updated_at: new Date(),
    };
    console.log("newContact", newContact);

    await db.contacts.insert(newContact);

    // get all contacts
    const contacts = await db.query(`select * from contacts`);

    res.status(200).send(contacts);
  } catch (error) {
    console.log("something went wrong: ", error);
    res.status(500).send(error);
  }
};

const editContact = async (req, res) => {
  try {
    const db = await req.app.get("db");
    const {
      editingContact, changes
    } = req.body;
    console.log(req.body)
    
    let fieldChanges = [{key: 'id', value: editingContact.id}, {key: 'updated_at', value: new Date()}]
    if (changes.firstName) {
      fieldChanges.push({key: 'first_name', value: changes.firstName})
    }
    if (changes.lastName) {
      fieldChanges.push({key: 'last_name', value: changes.lastName})
    }
    if (changes.phone) {
      fieldChanges.push({key: 'phone', value: changes.phone})
    }
    if (changes.email) {
      fieldChanges.push({key: 'email', value: changes.email})
    }
    if (changes.address1) {
      fieldChanges.push({key: 'address1', value: changes.address1})
    }
    if (changes.address2) {
      fieldChanges.push({key: 'address2', value: changes.address2})
    }
    if (changes.city) {
      fieldChanges.push({key: 'city', value: changes.city})
    }
    if (changes.state) {
      fieldChanges.push({key: 'state', value: changes.state})
    }
    if (changes.zip) {
      fieldChanges.push({key: 'zip', value: changes.zip})
    }
    console.log('fieldChanges: ', fieldChanges)

    /* convert fieldChanges array to a single object */
    const result = fieldChanges.reduce((obj, {key, value}) => ({...obj, [key]: value}), {});

    /* update the contact details in the db */
    await db.contacts.save(result)

    // get all contacts
    const contacts = await db.query(`select * from contacts`);

    res.status(200).send(contacts);
  } catch (error) {
    console.log("something went wrong: ", error);
    res.status(500).send(error);
  }
}

const deleteContact = async (req, res) => {
  try {
    const db = await req.app.get("db");
    const {
      editingContact
    } = req.body;
    console.log('req.body', req.body)

    /* delete the contact from the db */
    await db.contacts.destroy(editingContact.id)

    // send the updated contacts list and successful response code to the frontend
    res.status(200).send('Successfully deleted contact.');

  } catch (error) {
    console.log("something went wrong: ", error);
    res.status(500).send(error);
  }
}

module.exports = {
  createLogin,
  createSignup,
  getContacts,
  newContact,
  editContact,
  deleteContact
};
