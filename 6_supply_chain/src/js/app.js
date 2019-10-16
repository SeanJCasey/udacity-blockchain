App = {
    web3Provider: null,
    contracts: {},
    emptyAddress: "0x0000000000000000000000000000000000000000",
    sku: "vaccine01",
    upc: 0,
    metamaskAccountID: "0x0000000000000000000000000000000000000000",
    manufacturerID: "0x0000000000000000000000000000000000000000",
    distributorID: "0x0000000000000000000000000000000000000000",
    clinicID: "0x0000000000000000000000000000000000000000",
    patientID: "0x0000000000000000000000000000000000000000",
    addRoleID: "0x0000000000000000000000000000000000000000",
    manufacturerSku: "",
    distributorUpc: 0,
    clinicUpc: 0,
    patientUpc: 0,

    states: [
        "Created",
        "Ordered (Distributor)",
        "Picked Up (Distributor)",
        "Stored (Distributor)",
        "Ordered (Clinic)",
        "Dispatched (Clinic)",
        "Stored (Clinic)",
        "Requested (Patient)",
        "Administered (Clinic)"
    ],

    init: async function () {
        App.readForm();
        /// Setup access to blockchain
        return await App.initWeb3();
    },

    readForm: function () {
        // App.sku = $("#sku").val();
        App.upc = $("#upc").val();

        // App.ownerID = $("#ownerID").val();
        // App.manufacturerID = $("#manufacturerID").val();
        // App.distributorID = $("#distributorID").val();
        // App.clinicID = $("#clinicID").val();
        // App.patientID = $("#patientID").val();
        App.addRoleID = $("#addRole").val();

        App.manufacturerSku = $("#manufacturerSku").val();
        App.distributorUpc = $("#distributorUpc").val();
        App.clinicUpc = $("#clinicUpc").val();
        App.patientUpc = $("#patientUpc").val();

        console.log(
            App.sku,
            App.upc,
            // App.ownerID,
            App.manufacturerID,
            App.distributorID,
            App.clinicID,
            App.patientID,
        );
    },

    initWeb3: async function () {
        /// Find or Inject Web3 Provider
        /// Modern dapp browsers...
        if (window.ethereum) {
            App.web3Provider = window.ethereum;
            try {
                // Request account access
                await window.ethereum.enable();
            } catch (error) {
                // User denied account access...
                console.error("User denied account access")
            }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
            App.web3Provider = window.web3.currentProvider;
        }
        // If no injected web3 instance is detected, fall back to Ganache
        else {
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        }

        App.getMetaskAccountID();

        return App.initSupplyChain();
    },

    getMetaskAccountID: function () {
        web3 = new Web3(App.web3Provider);

        // Retrieving accounts
        web3.eth.getAccounts(function(err, res) {
            if (err) {
                console.log('Error:',err);
                return;
            }
            console.log('getMetaskID:',res);
            App.metamaskAccountID = res[0];

        })
    },

    initSupplyChain: function () {
        /// Source the truffle compiled smart contracts
        var jsonSupplyChain='../../build/contracts/SupplyChain.json';

        /// JSONfy the smart contracts
        $.getJSON(jsonSupplyChain, function(data) {
            console.log('data',data);
            var SupplyChainArtifact = data;
            App.contracts.SupplyChain = TruffleContract(SupplyChainArtifact);
            App.contracts.SupplyChain.setProvider(App.web3Provider);

            App.fetchItem();
            App.fetchEvents();

        });

        return App.bindEvents();
    },

    bindEvents: function() {
        $(document).on('click', App.handleButtonClick);
    },

    handleButtonClick: async function(event) {
        event.preventDefault();

        App.getMetaskAccountID();

        App.readForm();

        var processId = parseInt($(event.target).data('id'));
        console.log('processId',processId);

        switch(processId) {
            case 1:
                return await App.createItem(event);
                break;
            case 2:
                return await App.createOrderDist(event);
                break;
            case 3:
                return await App.pickUpDist(event);
                break;
            case 4:
                return await App.storeDist(event);
                break;
            case 5:
                return await App.orderClinic(event);
                break;
            case 6:
                return await App.dispatchClinic(event);
                break;
            case 7:
                return await App.storeClinic(event);
                break;
            case 8:
                return await App.requestItem(event);
                break;
            case 9:
                return await App.administerItem(event);
                break;
            case 10:
                return await App.fetchItem(event);
                break;
            case 11:
                return await App.addManufacturer(event);
                break;
            case 12:
                return await App.addDistributor(event);
                break;
            case 13:
                return await App.addClinic(event);
                break;
            case 14:
                return await App.addPatient(event);
                break;
            }
    },

    createItem: function(event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.createItem(App.manufacturerSku, {from: App.metamaskAccountID});
        }).then(function(result) {
            $("#ftc-item").text(result);
            console.log('createItem',result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    createOrderDist: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.createOrderDist(App.distributorUpc, {from: App.metamaskAccountID});
        }).then(function(result) {
            $('#upc').val(App.distributorUpc);
            App.fetchItem();
            console.log('createOrderDist',result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    pickUpDist: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.pickUpDist(App.distributorUpc, {from: App.metamaskAccountID});
        }).then(function(result) {
            $('#upc').val(App.distributorUpc);
            App.fetchItem();
            console.log('pickUpDist',result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    storeDist: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.storeDist(App.distributorUpc, {from: App.metamaskAccountID});
        }).then(function(result) {
            $('#upc').val(App.distributorUpc);
            App.fetchItem();
            console.log('storeDist',result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    orderClinic: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.orderClinic(App.clinicUpc, {from: App.metamaskAccountID});
        }).then(function(result) {
            $('#upc').val(App.clinicUpc);
            App.fetchItem();
            console.log('orderClinic',result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    dispatchClinic: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.dispatchClinic(App.distributorUpc, {from: App.metamaskAccountID});
        }).then(function(result) {
            $('#upc').val(App.distributorUpc);
            App.fetchItem();
            console.log('dispatchClinic',result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    storeClinic: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.storeClinic(App.clinicUpc, {from: App.metamaskAccountID});
        }).then(function(result) {
            $('#upc').val(App.clinicUpc);
            App.fetchItem();
            console.log('storeClinic',result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    requestItem: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.requestItem(App.patientUpc, {from: App.metamaskAccountID});
        }).then(function(result) {
            $('#upc').val(App.patientUpc);
            App.fetchItem();
            console.log('requestItem',result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    administerItem: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.administerItem(App.clinicUpc, {from: App.metamaskAccountID});
        }).then(function(result) {
            $('#upc').val(App.clinicUpc);
            App.fetchItem();
            console.log('administerItem',result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    addManufacturer: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.addManufacturer(App.addRoleID, {from: App.metamaskAccountID});
        }).then(function(result) {
            $("#ftc-item").text(result);
            console.log('addManufacturer',result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    addDistributor: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.addDistributor(App.addRoleID, {from: App.metamaskAccountID});
        }).then(function(result) {
            $("#ftc-item").text(result);
            console.log('addDistributer',result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    addClinic: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.addClinic(App.addRoleID, {from: App.metamaskAccountID});
        }).then(function(result) {
            $("#ftc-item").text(result);
            console.log('addClinic',result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    addPatient: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.addPatient(App.addRoleID, {from: App.metamaskAccountID});
        }).then(function(result) {
            $("#ftc-item").text(result);
            console.log('addPatient',result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    fetchItem: function () {
        App.upc = $('#upc').val();
        console.log('upc', App.upc);

        App.contracts.SupplyChain.deployed().then(function(instance) {
          return instance.fetchItem(App.upc);
        }).then(function(result) {
            console.log('fetchItem', result);
            $('#sku').val(result[0]);
            $('#manufacturerID').val(result[1]);
            $('#distributorID').val(result[2]);
            $('#clinicID').val(result[3]);
            $('#patientID').val(result[4]);
            $('#state').val(App.states[result[5].toString()]);
        }).catch(function(err) {
          console.log(err.message);
        });
    },

    fetchEvents: function () {
        if (typeof App.contracts.SupplyChain.currentProvider.sendAsync !== "function") {
            App.contracts.SupplyChain.currentProvider.sendAsync = function () {
                return App.contracts.SupplyChain.currentProvider.send.apply(
                App.contracts.SupplyChain.currentProvider,
                    arguments
              );
            };
        }

        App.contracts.SupplyChain.deployed().then(function(instance) {
        var events = instance.allEvents(function(err, log){
          if (!err)
            $("#ftc-events").append('<li>' + log.event + ' - ' + log.transactionHash + '</li>');
        });
        }).catch(function(err) {
          console.log(err.message);
        });

    }
};

$(function () {
    $(window).load(function () {
        App.init();
    });
});
