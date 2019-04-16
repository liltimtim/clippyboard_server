const SENDGRID_API_KEY =
  "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";
const sgMail = require("@sendgrid/mail");
const port = process.env.PORT || 1337;
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const twilio = require("twilio")(
  "AC7de28c2ee0a1e7d3e872cbe4dc7dde3b",
  "92e2149ceb04901d3559b28f0f7084d9"
);
sgMail.setApiKey(SENDGRID_API_KEY);
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const availablePreparers = () => {
  return [
    {
      id: 0,
      name: "Dave's Tax Service LLC"
    },
    {
      id: 1,
      name: "Bryan's Tax Service and Beyond!"
    },
    {
      id: 2,
      name: "Tim's FabTax Preping"
    }
  ];
};

const preparerForClient = id => {
  return availablePreparers().filter(v => {
    return String(v.id) == String(id);
  });
};
/**
 *
 * @param {Number} client
 * @returns {Array<{ id: Number }>}
 */
const availableClients = client => {
  return [
    {
      id: 0,
      name: "Tim Dillman",
      email: "liltimtim@gmail.com",
      password: "temp123!",
      phone: "8032626240",
      prepid: Number("0")
    },
    {
      id: 1,
      name: "Tim Dillman1",
      email: "liltimtim@gmail.com",
      password: "temp1!",
      phone: "8032626240",
      prepid: Number("0")
    },
    {
      id: 2,
      name: "Chris Dillman",
      email: "liltimtim@gmail.com",
      password: "temp123!",
      phone: "8032626240",
      prepid: Number("1")
    },
    {
      id: 3,
      name: "Susan Miller",
      email: "brhea@taxslayer.com",
      password: "password",
      prepid: Number("1")
    }
  ];
};
/**
 * @param {String} client
 * @param {Array<String>} ids
 */
const clientsForIds = (client, ids) => {
  return availableClients(client).filter(v => {
    return ids.includes(`${v.id}`);
  });
};

const clients = id => {
  switch (id) {
    case "0":
      return clientsForIds(id, ["0", "1"]);
    case "1":
      return clientsForIds(id, ["2", "3"]);
    default:
      return [];
  }
};

app.get("/clients", (req, res) => {
  const { client } = req.query;
  if (!client) {
    return res.json([]);
  }
  return res.json(clients(client));
});

app.get("/clients/:id/config", (req, res) => {
  console.log(req.params.id);
  let client = availableClients().filter(v => {
    return String(v.id) == req.params.id;
  });
  if (client.length === 0) {
    return res.status(404).json({});
  }
  return res.json(client[0]);
});

app.get("/apple-app-site-association", async (req, res) => {
  fs.readFile("./apple-app-site-association", "utf8", (err, contents) => {
    if (err) {
      return res.status(500).json({ error: "cannot read file" });
    }
    return res.send(contents);
  });
});

app.post("/sendemail", async (req, res) => {
  const { email, from, message, phone } = req.body;
  console.log(req.body);
  if (!email) {
    return res.status(400).json({ error: "email to query parameter required" });
  }
  if (!message) {
    return res.status(400).json({ error: "message is required" });
  }
  if (!from) {
    return res.status(400).json({ error: "from param required" });
  }

  const msg = {
    to: email,
    from: from,
    subject: "Message from your preparer",
    text: message
  };
  try {
    if (phone) {
      // send twilio
      let twilResult = await twilio.messages.create({
        body: message,
        from: "+17069552291",
        to: phone
      });
    }
    let result = await sgMail.send(msg);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error });
  }
});

app.listen(port, () =>
  console.log(`App running on port: ${port}.  http://localhost:${port}`)
);
