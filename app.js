require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const User = require('./model');

const getBurnedUsers = async () => {
  let allBurnedUsers = []
  let skip = 0;
  const pageSize = 100;

  while (true) {
    console.log(`Fetching users from ${skip} to ${skip + pageSize}`);
    const query = `
        query MyQuery {
          burnedUsers(first: ${pageSize}, skip: ${skip}) {
            id
          }
        }
      `;

    try {
      const response = await axios.post('https://api.thegraph.com/subgraphs/name/soumojit28/waltsvault', {
        query,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const { data } = response.data;
      console.log(data);
      const burnedUsers = data.burnedUsers.map((user) => user.id);

      allBurnedUsers = [...allBurnedUsers, ...burnedUsers];

      // Check if there are more users to fetch
      if (burnedUsers.length < pageSize) {
        break;
      }

      // Update the skip value for the next iteration
      skip += pageSize;
    } catch (error) {
      console.error('Error fetching data:', error);
      break;
    }
  }
  console.log(allBurnedUsers.length);
  return allBurnedUsers;
}

const getStakedUsers = async () => {
  let allStakedUsers = []
  let skip = 0;
  const pageSize = 100;

  while (true) {
    console.log(`Fetching users from ${skip} to ${skip + pageSize}`);
    const query = `
      query MyQuery {
        users(first: ${pageSize}, skip: ${skip}) {
          id
        }
      }
    `;

    try {
      const response = await axios.post('https://api.thegraph.com/subgraphs/name/soumojit28/ravendale-staking-test', {
        query,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const { data } = response.data;
      console.log(data);
      const stakedUsers = data.users.map((user) => user.id);

      allStakedUsers = [...allStakedUsers, ...stakedUsers];

      // Check if there are more users to fetch
      if (stakedUsers.length < pageSize) {
        break;
      }

      // Update the skip value for the next iteration
      skip += pageSize;
    } catch (error) {
      console.error('Error fetching data:', error);
      break;
    }
  }
  console.log(allStakedUsers.length);
  return allStakedUsers;
}

const main = async () => {
  let allUsers = [];
  const burnedUsers = await getBurnedUsers();
  const stakedUsers = await getStakedUsers();
  allUsers = [...burnedUsers, ...stakedUsers];
  console.log(allUsers.length);

  walletPoints = {};
  for (let i of allUsers) {
    walletPoints[i] = 0;
    try {
      const { data } = await axios.get(`https://merkel-dev.soumojitash.workers.dev/api/getPoint/` + i);
      console.log(data, i);
      walletPoints[i] = data;
    } catch (e) {
      console.log(e);
    }
  }
  console.log(walletPoints);
  for (let j in walletPoints) {
    try {
      // const user = new User({
      //   userAddress: j,
      //   points: walletPoints[j]
      // });
      // await user.save();
      //do upsert
      const filter = { userAddress: j };
      const update = { points: walletPoints[j] };
      await User.findOneAndUpdate(filter, update, {
        new: true,
        upsert: true // Make this update into an upsert
      });
    } catch (e) {
      console.log(e);
    }
  }
  //calculate ranks based on the points and update in database
  const allUsersData = await User.find().sort({ points: -1 });
  console.log(allUsersData);
  let rank = 1;
  let prevPoints = 0;
  for (let user of allUsersData) {
    if (user.points === prevPoints) {
      user.rank = rank;
    } else {
      user.rank = rank;
      rank++;
    }
    prevPoints = user.points;
    await user.save();
  }
  

  console.log("Done");
  //exit
  process.exit();
}

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
  console.log("Connected to DB");
  main();
}).catch((e) => {
  console.log(e);
});