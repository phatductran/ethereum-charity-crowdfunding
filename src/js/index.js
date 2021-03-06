Index = {
    web3Provider: null,
    contracts: {},

    init: function () {
        return Index.initWeb3();
    },

    initWeb3: function () {
        // Is there an injected web3 instance?
        if (typeof web3 !== 'undefined') {
            Index.web3Provider = web3.currentProvider;
        } else {
            // If no injected web3 instance is detected, fall back to Ganache
            Index.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        }
        web3 = new Web3(Index.web3Provider);

        return Index.initContract();
    },

    initContract: function () {
        $.getJSON('Funding.json', function (data) {
            // Get the necessary contract artifact file and instantiate it with truffle-contract
            var FundingArtifact = data;
            Index.contracts.Funding = TruffleContract(FundingArtifact);

            // Set the provider for our contract
            Index.contracts.Funding.setProvider(Index.web3Provider);

            return Index.showCampaigns();
        });

    },

    showCampaigns: function () {
        var fundingInstance;
        var lengthOfCampaigns;
        Index.contracts.Funding.deployed().then(function (instance) {
            fundingInstance = instance;
            return fundingInstance.getCampaignCount.call();

        }).then(function (length) {

            for (var i = 0; i < length; i++) {
                fundingInstance.getCampaign.call(i).then(function (campaign) {
                    const node = new Ipfs();
                    
                    node.once('ready', () => {

                        console.log('Online status: ', node.isOnline() ? 'online' : 'offline');
                        // node.files.cat(web3.toAscii(campaign[4]), function (err, data) {
                        node.cat(web3.toAscii(campaign[4]), function (err, data) {
                            if (err) {
                                console.error('Error - ipfs files cat', err, data);
                            }
                            localStorage.setItem("campaignList", data.toString());
                            // SC returns [id, creator's address, numOfToken, numOfTrans, ipfsHash]
                            var row = document.createElement("tr");
                            var col1 = document.createElement("td");
                            var col2 = document.createElement("td");
                            var col3 = document.createElement("td");
                            var col4 = document.createElement("td");
                            var col5 = document.createElement("td");
                            var col6 = document.createElement("td");
                            // donate button
                            var donateBtn = document.createElement("a");
                            donateBtn.className = "btn btn-primary text-light btnDonate";
                            donateBtn.innerText = "Donate";
                            donateBtn.href = "/donate.html?id=" + campaign[0].toNumber();
                            // append to col
                            // id
                            col1.appendChild(document.createTextNode(campaign[0].toNumber()+1));
                            // tokens - numOfTokens
                            col4.appendChild(document.createTextNode(campaign[2].toNumber()));
                            // donations - numOfTrans
                            col5.appendChild(document.createTextNode(campaign[3].toNumber()));
                            // donateBtn
                            col6.appendChild(donateBtn);
                            // data from ipfs hash
                            var jsonData = JSON.parse(data.toString());

                            // name of campaign
                            var nameOfCampaign = document.createElement("a");
                            nameOfCampaign.href = "/campaign.html?id=" + campaign[0].toNumber();
                            nameOfCampaign.innerText = jsonData.nameOfCampaign;
                            col2.appendChild(nameOfCampaign);

                            // created date
                            col3.appendChild(document.createTextNode(jsonData.createdDate));

                            // append to row
                            row.appendChild(col1);
                            row.appendChild(col2);
                            row.appendChild(col3);
                            row.appendChild(col4);
                            row.appendChild(col5);
                            row.appendChild(col6);
                            document.getElementById("campaigns-tbody").appendChild(row);
                        })
                    })
                });

            }
            // });
        }).then(function () {

        });

    },

    display: function (campaign) {
        console.log(campaign);
        // Get jsonData from ipfsHash

    },

    addToCampaignsTbl: function () {

    }

};

$(function () {
    $(window).load(function () {
        Index.init();
    });
});