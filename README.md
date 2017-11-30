# evcharger
Cost clearing and balancing in energy blockchain for KEBA based electric vehicle charging devices (Wallbox). Payment framework for distributed ledger in e-mobility scenarios. 

## Installation
`npm install -g evcharger`

## Usage
`stromdao.ev help`

## Use Cases

### Start/Stop charging a car - Retrieve delivered energy at the end
Use this only if you plan to do attended charging. For unattended charging use options that control wallbox. 

```
stromdao.ev start -i 192.168.192.24 TESTEV

stromdao.ev stop -i 192.168.192.24 TESTEV 

stromdao.ev retrieve -i 192.168.192.24 TESTEV
```

### Settlement and Clearing of charging sessions
Note: This requires to setup a Meter-Point-Operation

```
stromdao.ev report 101
stromdao.ev clearing --workprice 2500000 --sessionprice 1000000 TESTEV 101
```

In this example 101 is the session currently stored at report 101.  The workprice is 25ct per KWh and each session costs 1€

