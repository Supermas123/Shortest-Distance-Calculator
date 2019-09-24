/*global google, $*/
$(document).ready(function () {

    const geoCoder = new google.maps.Geocoder();
    const service = new google.maps.DistanceMatrixService();
    let origin = "";
    let destinations = [];
    let promiseArray = [];

    function emptyInputs() {
        document.getElementById("inputAddress").value = "";
        document.getElementById("inputAddress2").value = "";
        document.getElementById("inputCity").value = "";
        document.getElementById("inputState").getElementsByTagName('option')[0].selected = 'selected';
        document.getElementById("inputZip").value = "";
    }

    function goBack() {
        try {
            show("pageOne", "pageTwo");
            origin = "";
            destinations = [];
            promiseArray = [];

            let destItems = document.getElementById("dest-list");
            while (destItems.firstChild)
                destItems.removeChild(destItems.firstChild);

            let originItem = document.getElementById("origin-list");
            while (originItem.firstChild)
                originItem.removeChild(originItem.firstChild);

            let dataItem = document.getElementById("data-list");
            while (dataItem.firstChild)
                dataItem.removeChild(dataItem.firstChild);

            emptyInputs();

            checkCalculator();
        } catch (err) {
            throw `ERROR in trying to go back to main page because of: ${err}`;
        }

    }

    function createListItem() {
        try {
            let li = document.createElement("li");
            li.setAttribute("class", "list-group-item");

            let addressDiv = document.createElement("div");
            addressDiv.setAttribute("class", "finalAddress");

            let durationDiv = document.createElement("div");
            durationDiv.setAttribute("class", "duration");

            li.append(addressDiv);
            li.append(durationDiv);

            return li;
        } catch (err) {
            throw `ERROR in trying to go back to main page because of: ${err}`;
        }
    }

    function show(shown, hidden) {
        try {
            document.getElementById(shown).style.display = 'block';
            document.getElementById(hidden).style.display = 'none';
        } catch (err) {
            throw `ERROR in trying to show new page because of: ${err}`;
        }

    }

    function hideaAlerts() {
        try {
            $('#errorAlert').hide();
            $('#warningAlert').hide();
        } catch (err) {
            throw `ERROR in trying to hide alerts because of: ${err}`;
        }

    }

    function validateForm(_callback) {
        try {
            let city = document.getElementById("inputCity").value.trim();
            let state = document.getElementById("inputState").value;
            if (city.length != 0 && state != "Choose...") {
                _callback();
            } else {
                $('#warningAlert').show();
                setTimeout(function () {
                    $("#warningAlert").fadeOut(2000, "swing");
                }, 3000);
            }
        } catch (err) {
            throw `Form could not be validated because of: ${err}`;
        }

    }

    function setOrigin() {
        try {
            let fullAddress = getAddress();

            let ul = document.getElementById("origin-list");
            if (ul.childNodes.length > 0)
                ul.removeChild(ul.childNodes[0]);

            let li = document.createElement("li");
            li.setAttribute("class", "list-group-item");
            li.setAttribute("id", "origin-placeholder");

            let addressDiv = document.createElement("div");
            addressDiv.setAttribute("class", "address");
            addressDiv.append(document.createTextNode(fullAddress));

            let iconDiv = document.createElement("div");
            iconDiv.setAttribute("class", "icon-holder");
            iconDiv.onclick = function () {
                iconDiv.parentNode.parentNode.removeChild(li);
                origin = "";
                checkCalculator();
            }

            let icon = document.createElement("i");
            icon.setAttribute("class", "material-icons icon");
            icon.append(document.createTextNode("close"));

            iconDiv.append(icon);

            li.append(addressDiv);
            li.append(iconDiv);

            ul.appendChild(li);

            origin = fullAddress;
            checkCalculator();
            emptyInputs();
        } catch (err) {
            throw `ERROR in setting origin because of: ${err}`;
        }

    }

    function addDest() {
        try {
            let fullAddress = getAddress();
            let ul = document.getElementById("dest-list");
            let li = document.createElement("li");
            li.setAttribute("class", "list-group-item");

            let addressDiv = document.createElement("div");
            addressDiv.setAttribute("class", "address");
            addressDiv.append(document.createTextNode(fullAddress));

            let iconDiv = document.createElement("div");
            iconDiv.setAttribute("class", "icon-holder");
            iconDiv.onclick = function () {
                iconDiv.parentNode.parentNode.removeChild(li);
                let index = destinations.indexOf(fullAddress);
                destinations.splice(index, 1);
                checkCalculator();
            }

            let icon = document.createElement("i");
            icon.setAttribute("class", "material-icons icon");
            icon.append(document.createTextNode("close"));

            iconDiv.append(icon);

            li.append(addressDiv);
            li.append(iconDiv);

            ul.appendChild(li);

            destinations.push(fullAddress);
            checkCalculator();
            emptyInputs();
        } catch (err) {
            throw `ERROR in adding Destination because of: ${err}`;
        }

    }

    function getAddress() {
        try {
            let address1 = document.getElementById("inputAddress").value.trim();
            let address2 = document.getElementById("inputAddress2").value.trim();
            let city = document.getElementById("inputCity").value.trim();
            let state = document.getElementById("inputState").value.trim();
            let zipcode = document.getElementById("inputZip").value.trim();
            let fullAddress = `${address1} ${address2} ${city} ${state} ${zipcode}`;

            return fullAddress.trim();
        } catch (err) {
            throw `ERROR in getting address because of: ${err}`;
        }


    }

    function checkCalculator() {
        try {
            let calcButton = document.getElementById("calculate-button");
            if (destinations.length != 0 && origin != "")
                calcButton.disabled = false;
            else 
               calcButton.disabled = true 
                
        } catch (err) {
            throw `ERROR in checking calc button because of: ${err}`;
        }


    }

    function createObject(address) {
        return new Promise(function (resolve, reject) {
            geoCoder.geocode({
                'address': address
            }, function (results, status) {
                if (status === 'OK')
                    resolve(new google.maps.LatLng(results[0].geometry.location.lat(), results[0].geometry.location.lng()));
                else
                    reject(status);
            });
        });

    }

    function CalculateDurations() {

        for (let i = 0; i < destinations.length; i++)
            promiseArray.push(createObject(destinations[i]));

        Promise.all(promiseArray).then(
            function (returnVals) {
                let originObj = returnVals.shift();
                getDistance(originObj, returnVals).then(function (distances) {
                    distances.sort((a, b) => {
                        return a.duration_in_seconds - b.duration_in_seconds;
                    });
                    show("pageTwo", "pageOne");
                    let ul = document.getElementById("data-list");
                    for (let i = 0; i < distances.length; i++) {
                        let listItem = createListItem();
                        listItem.children[0].innerHTML = distances[i].destination;
                        listItem.children[1].innerHTML = distances[i].duration;
                        ul.append(listItem)
                    }
                }).catch(function (status) {
                    $('#errorAlert').show();
                    setTimeout(function () {
                        $("#errorAlert").fadeOut(2000, "swing");
                    }, 3000);
                    throw `Google Maps Could Not Find Location. Status: ${status}`;
                });
            }
        ).catch(function (status) {
            $('#errorAlert').show();
            setTimeout(function () {
                $("#errorAlert").fadeOut(2000, "swing");
            }, 3000);
            throw `Google Maps Could Not Find Location. Status: ${status}`;
        });
    }

    function getDistance(origin, destination) {
        return new Promise(function (resolve, reject) {
            service.getDistanceMatrix({
                origins: [origin],
                destinations: destination,
                travelMode: 'DRIVING',
                drivingOptions: {
                    departureTime: new Date(Date.now()),
                    trafficModel: 'bestguess'
                },
                unitSystem: google.maps.UnitSystem.IMPERIAL,
            }, function (response, status) {
                if (status == 'OK') {
                    let finalObjArray = [];
                    var destinations = response.destinationAddresses;
                    var results = response.rows[0].elements;
                    for (let j = 0; j < results.length; j++) {
                        let element = results[j];
                        let value = element.duration_in_traffic.value;
                        let duration = element.duration_in_traffic.text;
                        let to = destinations[j];
                        finalObjArray.push({
                            destination: to,
                            duration_in_seconds: value,
                            duration: duration
                        });
                    }
                    resolve(finalObjArray);
                } else
                    reject(status);
            });
        });
    }

    function beginCalculation() {
        try {
            destinations.unshift(origin);
            CalculateDurations();
        } catch (err) {
            throw `ERROR in beginning calculation because of: ${err}`;
        }
    }

    function main() {
        try {
            hideaAlerts();
            show("pageOne", "pageTwo");
            document.getElementById("set-origin").addEventListener("click", function () {
                validateForm(setOrigin);
            });
            document.getElementById("add-dest").addEventListener("click", function () {
                validateForm(addDest);
            });
            document.getElementById("calculate-button").addEventListener("click", beginCalculation);
            document.getElementById("back-button").addEventListener("click", goBack);
        } catch (err) {
            throw `ERROR in main because of: ${err}`;
        }
    }

    main();

});
