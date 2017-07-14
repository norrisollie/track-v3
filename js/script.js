// scripts

// make sure it is https not http
if (window.location.protocol != 'https:') window.location.protocol = 'https'

function app() {

    // var token = "c8eebaa7-d421-4025-bb02-989cc9c53b39";

    //console.log("App is running");

    // store element in dom
    var loadingHeaderMessage = document.getElementById("loading-message");
    var loadingImage = document.getElementById("loading-image");

    // change inner html
    loadingHeaderMessage.innerHTML = "Finding nearest stations";
    loadingImage.innerHTML = "";

    // start finding user coords
    // function to see whether browser supports geolocation and get their location if it does
    function getUserLocation() {

        // if browser doesnt support geolocation
        if (!navigator.geolocation) {

            // display message to user
            loadingHeaderMessage.innerHTML = "Your browser doesn't support GeoLocation";
            loadingImage.innerHTML = "";
            return;

        }

        // if users location is found
        function success(position) {

            // store users latitude and longitude in dom
            var latitude = position.coords.latitude;
            var longitude = position.coords.longitude;

            // log user's coordinates to the console
            //console.log(latitude + "," + longitude);

            // construct url
            var appID = "91798de7",
                appKey = "22d09f5f443c993b4cee9062a5bc2a77",
                nearestStationsUrl = "https://transportapi.com/v3/uk/train/stations/near.json?app_id=" + appID + "&app_key=" + appKey + "&lat=" + latitude + "&lon=" + longitude + "&rpp=5";

            // log url to console
            //console.log(nearestStationsUrl);

            // make ajax request
            var nearestStationsReq = new XMLHttpRequest();

            nearestStationsReq.open("GET", nearestStationsUrl, true);

            // function to run when on load
            nearestStationsReq.onload = function() {

                // run if status is between 200 and 399
                if (this.status >= 200 && this.status < 400) {

                    // store response in DOM
                    var res = JSON.parse(this.response);

                    // log response to console
                    //console.log(res);

                    // enter stations array
                    var stations = res.stations

                    var reqUrls = []
                    var serviceUrls = []
                    var serviceTemplateArr = [];

                    // for loop to iterate through array
                    for (var i = 0; i < stations.length; i++) {

                        // store values in dom
                        var code = stations[i].station_code,
                            name = stations[i].name,
                            name = name;
                        distance = stations[i].distance,
                            // distance in km
                            distance = distance / 1000;
                        // round the number and add km to end
                        distance = distance.toFixed(1) + "km";

                        // url to get live train timetable
                        var urls = "https://transportapi.com/v3/uk/train/station/" + code + "/live.json?app_id=" + appID + "&app_key=" + appKey + "&darwin=false&train_status=passenger"

                        // log to console
                        //console.log(code + ", " + name + ", " + distance + ", " + urls);

                        // push urls to an array
                        reqUrls.push(urls);

                        // store element in dom
                        var timetableWrapper = document.querySelector(".timetable-wrapper");
                        // template for each row
                        var stationTemplate =
                            '<div class="station-row">' +
                            '<div class="station-name"><p>' + name + '</p></div>' +
                            '<div class="service-wrapper" data-currentStation="' + name +'">' +
                            '</div>';

                        // add template to wrapper
                        timetableWrapper.innerHTML += stationTemplate;
                    }

                    // change loading message
                    loadingHeaderMessage.innerHTML = "Checking the timetables";

                    // store service wrappers in dom
                    var serviceWrappers = document.querySelectorAll(".service-wrapper");

                    var stationOne = new XMLHttpRequest();
                    stationOne.open('GET', reqUrls[0], true);

                    stationOne.onload = function() {
                        if (this.status >= 200 && this.status < 400) {
                            // Success!
                            var res = JSON.parse(this.response);

                            var departures = res.departures.all;

                            for (var i = 0; i < departures.length; i++) {

                                //console.log(res);

                                // store values in dom
                                var currentStation = res.station_name;
                                var aimedDepartTime = departures[i].aimed_departure_time;
                                var expectedDepartTime = departures[i].expected_departure_time;
                                var destination = departures[i].destination_name;
                                var platform = departures[i].platform;
                                var operator = departures[i].operator_name;
                                var status = departures[i].status;
                                var trainUID = departures[i].train_uid;

                                if (platform === null) {

                                // change variable to string
                                var platform = "n/a";

                                }

                                // logged
                                //console.log("Current Station: " + currentStation + " Aimed: " + aimedDepartTime + " | Expected: " + expectedDepartTime + " | Destination: " + destination + " | Platform: " + platform + " | Status: " + status + " | Operator: " + operator + " | ID: " + trainUID);

                                // switch statement to change styling based on status
                                switch (status) {
                                    case "EARLY":
                                        var status = '<span class="status on-time">On time</span>';
                                        break;
                                    case "ON TIME":
                                        var status = '<span class="status on-time">On time</span>';
                                        break;
                                    case "LATE":
                                        var status = '<span class="status delayed">Delayed' + " " + expectedDepartTime + '</span>';
                                        var aimedDepartTime = '<span class="time unavailable strikethrough">' + aimedDepartTime + '</span>';
                                        break;
                                    case "CANCELLED":
                                        var status = '<span class="status cancelled">Cancelled</span>';
                                        break;
                                    case "NO REPORT":
                                        var status = '<span class="status unavailable">Unavailable</span>';
                                        break;
                                    case "STARTS HERE":
                                        var status = '<span class="status on-time">On time</span>';
                                        break;
                                    case "OFF ROUTE":
                                        var status = '<span class="status unavailable">Unavailable</span>';
                                        break;
                                    case "CHANGE OF ORIGIN":
                                        var status = '<span class="status unavailable">Unavailable</span>';
                                        break;
                                    default:
                                        var status = '<span class="status unavailable">Unavailable</span>';
                                }

                                // template to create each services div element
                                var serviceTemplate =
                                    '<div class="service" data-uid="' + trainUID + '">' +
                                    '<div class="time-status"><span class="time">' + aimedDepartTime + '</span>' + status + '<span class="platform">Plat. <span class="platform-number">' + platform + '</span></span></div>' +
                                    '<div class="destination"><span class="destination">' + destination + '</span></div>' +
                                    '<div class="train-operator">Operated by <span class="operator">' + operator + '</span></div>' +
                                    '</div>';

                                // create urls for each service
                                var serviceUrl = "https://transportapi.com/v3/uk/train/service/train_uid:" + trainUID + "///timetable.json?app_id=" + appID + "&app_key=" + appKey + "&darwin=true&live=true";

                                serviceWrappers[0].innerHTML += serviceTemplate;

                            }

                        } else {
                            // We reached our target server, but it returned an error

                        }

                    };

                    stationOne.onerror = function() {
                        // There was a connection error of some sort
                    };

                    stationOne.send();

                    // station 2
                    var stationTwo = new XMLHttpRequest();
                    stationTwo.open('GET', reqUrls[1], true);

                    stationTwo.onload = function() {
                        if (this.status >= 200 && this.status < 400) {
                            // Success!
                            var res = JSON.parse(this.response);

                            var departures = res.departures.all;

                            for (var i = 0; i < departures.length; i++) {

                                //console.log(res);

                                // store values in dom
                                var currentStation = res.station_name;
                                var aimedDepartTime = departures[i].aimed_departure_time;
                                var expectedDepartTime = departures[i].expected_departure_time;
                                var destination = departures[i].destination_name;
                                var platform = departures[i].platform;
                                var operator = departures[i].operator_name;
                                var status = departures[i].status;
                                var trainUID = departures[i].train_uid;

                                if (platform === null) {

                                // change variable to  string
                                var platform = "n/a";

                                }

                                // logged
                                //console.log("Current Station: " + currentStation + " Aimed: " + aimedDepartTime + " | Expected: " + expectedDepartTime + " | Destination: " + destination + " | Platform: " + platform + " | Status: " + status + " | Operator: " + operator + " | ID: " + trainUID);

                                // switch statement to change styling based on status
                                switch (status) {
                                    case "EARLY":
                                        var status = '<span class="status on-time">On time</span>';
                                        break;
                                    case "ON TIME":
                                        var status = '<span class="status on-time">On time</span>';
                                        break;
                                    case "LATE":
                                        var status = '<span class="status delayed">Delayed' + " " + expectedDepartTime + '</span>';
                                        var aimedDepartTime = '<span class="time unavailable strikethrough">' + aimedDepartTime + '</span>';
                                        break;
                                    case "CANCELLED":
                                        var status = '<span class="status cancelled">Cancelled</span>';
                                        break;
                                    case "NO REPORT":
                                        var status = '<span class="status unavailable">Unavailable</span>';
                                        break;
                                    case "STARTS HERE":
                                        var status = '<span class="status on-time">On time</span>';
                                        break;
                                    case "OFF ROUTE":
                                        var status = '<span class="status unavailable">Unavailable</span>';
                                        break;
                                    case "CHANGE OF ORIGIN":
                                        var status = '<span class="status unavailable">Unavailable</span>';
                                        break;
                                    default:
                                        var status = '<span class="status unavailable">Unavailable</span>';
                                }

                                // template to create each services div element
                                var serviceTemplate =
                                    '<div class="service" data-uid="' + trainUID + '">' +
                                    '<div class="time-status"><span class="time">' + aimedDepartTime + '</span>' + status + '<span class="platform">Plat. <span class="platform-number">' + platform + '</span></span></div>' +
                                    '<div class="destination"><span class="destination">' + destination + '</span></div>' +
                                    '<div class="train-operator">Operated by <span class="operator">' + operator + '</span></div>' +
                                    '</div>';

                                // create urls for each service
                                var serviceUrl = "https://transportapi.com/v3/uk/train/service/train_uid:" + trainUID + "///timetable.json?app_id=" + appID + "&app_key=" + appKey + "&darwin=true&live=true";

                                serviceWrappers[1].innerHTML += serviceTemplate;

                            }

                        } else {
                            // We reached our target server, but it returned an error

                        }

                    };

                    stationTwo.onerror = function() {
                        // There was a connection error of some sort
                    };

                    stationTwo.send();

                    // station 3
                    var stationThree = new XMLHttpRequest();
                    stationThree.open('GET', reqUrls[2], true);

                    stationThree.onload = function() {
                        if (this.status >= 200 && this.status < 400) {
                            // Success!
                            var res = JSON.parse(this.response);

                            var departures = res.departures.all;

                            for (var i = 0; i < departures.length; i++) {

                                //console.log(res);

                                // store values in dom
                                var currentStation = res.station_name;
                                var aimedDepartTime = departures[i].aimed_departure_time;
                                var expectedDepartTime = departures[i].expected_departure_time;
                                var destination = departures[i].destination_name;
                                var platform = departures[i].platform;
                                var operator = departures[i].operator_name;
                                var status = departures[i].status;
                                var trainUID = departures[i].train_uid;

                                if (platform === null) {

                                // change variable to empty string
                                var platform = "n/a";

                                }

                                // logged
                                //console.log("Current Station: " + currentStation + " Aimed: " + aimedDepartTime + " | Expected: " + expectedDepartTime + " | Destination: " + destination + " | Platform: " + platform + " | Status: " + status + " | Operator: " + operator + " | ID: " + trainUID);

                                // switch statement to change styling based on status
                                switch (status) {
                                    case "EARLY":
                                        var status = '<span class="status on-time">On time</span>';
                                        break;
                                    case "ON TIME":
                                        var status = '<span class="status on-time">On time</span>';
                                        break;
                                    case "LATE":
                                        var status = '<span class="status delayed">Delayed' + " " + expectedDepartTime + '</span>';
                                        var aimedDepartTime = '<span class="time unavailable strikethrough">' + aimedDepartTime + '</span>';
                                        break;
                                    case "CANCELLED":
                                        var status = '<span class="status cancelled">Cancelled</span>';
                                        break;
                                    case "NO REPORT":
                                        var status = '<span class="status unavailable">Unavailable</span>';
                                        break;
                                    case "STARTS HERE":
                                        var status = '<span class="status on-time">On time</span>';
                                        break;
                                    case "OFF ROUTE":
                                        var status = '<span class="status unavailable">Unavailable</span>';
                                        break;
                                    case "CHANGE OF ORIGIN":
                                        var status = '<span class="status unavailable">Unavailable</span>';
                                        break;
                                    default:
                                        var status = '<span class="status unavailable">Unavailable</span>';
                                }

                                // template to create each services div element
                                var serviceTemplate =
                                    '<div class="service" data-uid="' + trainUID + '">' +
                                    '<div class="time-status"><span class="time">' + aimedDepartTime + '</span>' + status + '<span class="platform">Plat. <span class="platform-number">' + platform + '</span></span></div>' +
                                    '<div class="destination"><span class="destination">' + destination + '</span></div>' +
                                    '<div class="train-operator">Operated by <span class="operator">' + operator + '</span></div>' +
                                    '</div>';

                                // create urls for each service
                                var serviceUrl = "https://transportapi.com/v3/uk/train/service/train_uid:" + trainUID + "///timetable.json?app_id=" + appID + "&app_key=" + appKey + "&darwin=true&live=true";

                                serviceWrappers[2].innerHTML += serviceTemplate;

                            }

                        } else {
                            // We reached our target server, but it returned an error

                        }

                    };

                    stationThree.onerror = function() {
                        // There was a connection error of some sort
                    };

                    stationThree.send();

                    // station 4
                    var stationFour = new XMLHttpRequest();
                    stationFour.open('GET', reqUrls[3], true);

                    stationFour.onload = function() {
                        if (this.status >= 200 && this.status < 400) {
                            // Success!
                            var res = JSON.parse(this.response);

                            var departures = res.departures.all;

                            for (var i = 0; i < departures.length; i++) {

                                //console.log(res);

                                // store values in dom
                                var currentStation = res.station_name;
                                var aimedDepartTime = departures[i].aimed_departure_time;
                                var expectedDepartTime = departures[i].expected_departure_time;
                                var destination = departures[i].destination_name;
                                var platform = departures[i].platform;
                                var operator = departures[i].operator_name;
                                var status = departures[i].status;
                                var trainUID = departures[i].train_uid;

                                if (platform === null) {

                                // change variable to empty string
                                var platform = "n/a";

                                }

                                // logged
                                //console.log("Current Station: " + currentStation + " Aimed: " + aimedDepartTime + " | Expected: " + expectedDepartTime + " | Destination: " + destination + " | Platform: " + platform + " | Status: " + status + " | Operator: " + operator + " | ID: " + trainUID);

                                // switch statement to change styling based on status
                                switch (status) {
                                    case "EARLY":
                                        var status = '<span class="status on-time">On time</span>';
                                        break;
                                    case "ON TIME":
                                        var status = '<span class="status on-time">On time</span>';
                                        break;
                                    case "LATE":
                                        var status = '<span class="status delayed">Delayed' + " " + expectedDepartTime + '</span>';
                                        var aimedDepartTime = '<span class="time unavailable strikethrough">' + aimedDepartTime + '</span>';
                                        break;
                                    case "CANCELLED":
                                        var status = '<span class="status cancelled">Cancelled</span>';
                                        break;
                                    case "NO REPORT":
                                        var status = '<span class="status unavailable">Unavailable</span>';
                                        break;
                                    case "STARTS HERE":
                                        var status = '<span class="status on-time">On time</span>';
                                        break;
                                    case "OFF ROUTE":
                                        var status = '<span class="status unavailable">Unavailable</span>';
                                        break;
                                    case "CHANGE OF ORIGIN":
                                        var status = '<span class="status unavailable">Unavailable</span>';
                                        break;
                                    default:
                                        var status = '<span class="status unavailable">Unavailable</span>';
                                }

                                // template to create each services div element
                                var serviceTemplate =
                                    '<div class="service" data-uid="' + trainUID + '">' +
                                    '<div class="time-status"><span class="time">' + aimedDepartTime + '</span>' + status + '<span class="platform">Plat. <span class="platform-number">' + platform + '</span></span></div>' +
                                    '<div class="destination"><span class="destination">' + destination + '</span></div>' +
                                    '<div class="train-operator">Operated by <span class="operator">' + operator + '</span></div>' +
                                    '</div>';

                                // create urls for each service
                                var serviceUrl = "https://transportapi.com/v3/uk/train/service/train_uid:" + trainUID + "///timetable.json?app_id=" + appID + "&app_key=" + appKey + "&darwin=true&live=true";

                                serviceWrappers[3].innerHTML += serviceTemplate;

                            }

                        } else {
                            // We reached our target server, but it returned an error

                        }

                    };

                    stationFour.onerror = function() {
                        // There was a connection error of some sort
                    };

                    stationFour.send();

                    var serviceFive = new XMLHttpRequest();
                    serviceFive.open('GET', reqUrls[4], true);

                    serviceFive.onload = function() {
                        if (this.status >= 200 && this.status < 400) {
                            // Success!
                            var res = JSON.parse(this.response);

                            var departures = res.departures.all;

                            for (var i = 0; i < departures.length; i++) {

                                //console.log(res);

                                // store values in dom
                                var currentStation = res.station_name;
                                var aimedDepartTime = departures[i].aimed_departure_time;
                                var expectedDepartTime = departures[i].expected_departure_time;
                                var destination = departures[i].destination_name;
                                var platform = departures[i].platform;
                                var operator = departures[i].operator_name;
                                var status = departures[i].status;
                                var trainUID = departures[i].train_uid;

                                if (platform === null) {

                                // change variable to empty string
                                var platform = "n/a";

                                }

                                // logged
                                //console.log("Current Station: " + currentStation + " Aimed: " + aimedDepartTime + " | Expected: " + expectedDepartTime + " | Destination: " + destination + " | Platform: " + platform + " | Status: " + status + " | Operator: " + operator + " | ID: " + trainUID);

                                // switch statement to change styling based on status
                                switch (status) {
                                    case "EARLY":
                                        var status = '<span class="status on-time">On time</span>';
                                        break;
                                    case "ON TIME":
                                        var status = '<span class="status on-time">On time</span>';
                                        break;
                                    case "LATE":
                                        var status = '<span class="status delayed">Delayed' + " " + expectedDepartTime + '</span>';
                                        var aimedDepartTime = '<span class="time unavailable strikethrough">' + aimedDepartTime + '</span>';
                                        break;
                                    case "CANCELLED":
                                        var status = '<span class="status cancelled">Cancelled</span>';
                                        break;
                                    case "NO REPORT":
                                        var status = '<span class="status unavailable">Unavailable</span>';
                                        break;
                                    case "STARTS HERE":
                                        var status = '<span class="status on-time">On time</span>';
                                        break;
                                    case "OFF ROUTE":
                                        var status = '<span class="status unavailable">Unavailable</span>';
                                        break;
                                    case "CHANGE OF ORIGIN":
                                        var status = '<span class="status unavailable">Unavailable</span>';
                                        break;
                                    default:
                                        var status = '<span class="status unavailable">Unavailable</span>';
                                }

                                // template to create each services div element
                                var serviceTemplate =
                                    '<div class="service" data-uid="' + trainUID + '">' +
                                    '<div class="time-status"><span class="time">' + aimedDepartTime + '</span>' + status + '<span class="platform">Plat. <span class="platform-number">' + platform + '</span></span></div>' +
                                    '<div class="destination"><span class="destination">' + destination + '</span></div>' +
                                    '<div class="train-operator">Operated by <span class="operator">' + operator + '</span></div>' +
                                    '</div>';

                                // create urls for each service
                                var serviceUrl = "https://transportapi.com/v3/uk/train/service/train_uid:" + trainUID + "///timetable.json?app_id=" + appID + "&app_key=" + appKey + "&darwin=true&live=true";

                                serviceWrappers[4].innerHTML += serviceTemplate;

                                var timeTableWindow = document.getElementById("timetable")

                    timeTableWindow.classList.add("reposition");

                            }

                        } else {
                            // We reached our target server, but it returned an error

                        }

                    };

                    serviceFive.onerror = function() {
                        // There was a connection error of some sort
                    };

                    serviceFive.send();

                } else {
                    // if status is not between 200 and 399
                    loadingHeaderMessage.innerHTML = "Unable to find closest stations";
                    loadingImage.innerHTML = "";
                }
            };

            // if there is a connection error
            nearestStationsReq.onerror = function() {
                // connection error
                loadingHeaderMessage.innerHTML = "Unable to find closest stations";
                loadingImage.innerHTML = "";
            }

            // send the request
            nearestStationsReq.send();

        }

        // if there is an error
        function error() {

            // display message to user
            loadingHeaderMessage.innerHTML = "Unable to find closest stations";
            loadingImage.innerHTML = "";
        }

        // callback to decide which function to run
        navigator.geolocation.getCurrentPosition(success, error);
    }

    getUserLocation();

}

window.onload = app();