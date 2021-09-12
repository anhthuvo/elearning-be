const MongoClient = require("mongodb").MongoClient;

const uri =
  "mongodb+srv://everly:xanhduong@elearning.whpyx.mongodb.net/elearning?retryWrites=true&w=majority";
const client = new MongoClient(uri);

const createUser = async (req, res, next) => {
  try {
    await client.connect();
    const database = client.db();
    const result = await database.collection('user').insertOne({
      email: 'newzon26@gmail.com',
      fisrtname: 'Khoi',
      lastname: 'Vo',
      phone: '',
      role: 'student'
    });
    return res.json({message : result})
  }
  catch (error) {
    console.log(error)
    return res.json({message : 'failed'})
  } 
  finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

const getUser = async (req, res, next) => {
  console.log('getUser');
  try {
    await client.connect();
    const database = client.db('elearning');
    const result = await database.collection('user').findOne({ email : 'newzon263@gmail.com' });
    console.log('result', result);
    return res.json({message : result})
  }
  catch (error) {
    console.log('error', error)
  } 
  finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

module.exports = {
  createUser,
  getUser
}