import React, { Component } from "react";
import Beasiswa from "../contracts/Beasiswa.json";
import getWeb3 from "../getWeb3";

import '../index.css';

import NavigationAdmin from './NavigationAdmin';
import Navigation from './Navigation';
import { Link } from 'react-router-dom';
import { FormGroup, FormControl, Button } from 'react-bootstrap';

class ListMahasiswa extends Component {
  constructor(props) {
    super(props)

    this.state = {
      // EvotingInstance: undefined,
      BeasiswaInstance: undefined,
      account: null,
      web3: null,
      jumlah_mahasiswa: 0,
      listMahasiswa: [],
      listMahasiswa_fil: [],
      loaded: false,
      isOwner: false,
    }
  }

  doFilterNama = event => {
    var str = event.target.value;
    this.setState({ listMahasiswa_fil: null });        
    let filtered = [];
    for (let i = 0; i < this.state.listMahasiswa.length; i++) {
      if (this.state.listMahasiswa[i][1].toLowerCase().includes(str.toLowerCase())) {
        filtered.push(this.state.listMahasiswa[i]);
      }
    }
    this.setState({ listMahasiswa_fil: filtered });        
  }

  doFilterNIM = event => {
    var str = event.target.value;
    this.setState({ listMahasiswa_fil: null });        
    let filtered = [];
    for (let i = 0; i < this.state.listMahasiswa.length; i++) {
      if (this.state.listMahasiswa[i][2].toLowerCase().includes(str.toLowerCase())) {
        filtered.push(this.state.listMahasiswa[i]);
      }
    }
    this.setState({ listMahasiswa_fil: filtered });        
  }
  // getCandidates = async () => {
  //   let result = await this.state.EvotingInstance.methods.getCandidates().call();

  //   this.setState({ candidates : result });
  //   for(let i =0; i <result.length ; i++)


  // }

  componentDidMount = async () => {

    // FOR REFRESHING PAGE ONLY ONCE -
    if (!window.location.hash) {
      window.location = window.location + '#loaded';
      window.location.reload();
    }

    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = Beasiswa.networks[networkId];
      const instance = new web3.eth.Contract(
        Beasiswa.abi,
        deployedNetwork && deployedNetwork.address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.

      // this.setState({ web3, accounts, contract: instance }, this.runExample);
        this.setState({ BeasiswaInstance: instance, web3: web3, account: accounts[0] });

        let jumlah_mahasiswa = await this.state.BeasiswaInstance.methods.getSumAllMahasiswa().call();
        this.setState({ jumlah_mahasiswa: jumlah_mahasiswa });

        let all_mahasiswa = [];
        for (let i = 0; i < jumlah_mahasiswa; i++) {
            let mhs = await this.state.BeasiswaInstance.methods.list_mahasiswa_admin(i).call();
            all_mahasiswa.push(mhs);
        }

        // daftar_mahasiswa = await this.state.BeasiswaInstance.methods.getAllMahasiswa().call();
        console.log('all Mahasiswa');
        console.log(all_mahasiswa);

        this.setState({ listMahasiswa: all_mahasiswa });
        this.setState({ listMahasiswa_fil: all_mahasiswa });

      const owner = await this.state.BeasiswaInstance.methods.Admin().call();
      if (this.state.account === owner) {
        this.setState({ isOwner: true });
      }

    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };


  render() {
    let daftarMahasiswa;
    if (this.state.listMahasiswa_fil) {
        // console.log(this.state.listMahasiswa_fil);
        if (this.state.listMahasiswa_fil.length > 0) {
            daftarMahasiswa = this.state.listMahasiswa_fil.map((Data_Mahasiswa) => {
                return (
                    <div className="candidate">
                        <div className="candidateName">
                        {Data_Mahasiswa.nama} || {Data_Mahasiswa.nim}
                        </div>
                        <div className="CandidateDetails">
                        <div>
                            Tempat / Tanggal Lahir : {Data_Mahasiswa.ttl}
                        </div>
                        <div>
                            Alamat : {Data_Mahasiswa.alamat}
                        </div>
                        <div>
                            E-Mail : {Data_Mahasiswa.email}
                        </div>
                        </div>
                    </div>
                );
            });
        }else{
            daftarMahasiswa = [];
            daftarMahasiswa.push( 
                <div className="candidate">
                <div className="CandidateDetails">
                    <h1>Belum ada data.</h1>
                </div>
                </div>
            );
        }   
    }  

    if (!this.state.web3) {
      return (
        <div className="CandidateDetails">
          <div className="CandidateDetails-title">
            <h1>
              Loading Web3, accounts, and contract..
            </h1>
          </div>
          {this.state.isOwner ? <NavigationAdmin /> : <Navigation />}
        </div>
      );
    }

    return (
      <div className="CandidateDetails">
        {this.state.isOwner ? <NavigationAdmin /> : <Navigation />}
        <div className="CandidateDetails-title">
          <h1>
            {" LIST MAHASISWA TERDAFTAR di SISTEM "}
          </h1>
        </div>


        <div className="section-title">
          <h3>Total Jumlah Mahasiswa : <span>{this.state.jumlah_mahasiswa}</span></h3>
        </div>
        <div className="row">
          <div className="col-md-3"></div>
          <div className="col-md-3">
            <FormControl 
              input='text' 
              placeholder='Filter NIM' 
              value={this.state.filter_nim} 
              onChange={this.doFilterNIM}
            />
          </div>
          <div className="col-md-3">
            <FormControl 
              input='text' 
              placeholder='Filter Nama' 
              value={this.state.filter_nama} 
              onChange={this.doFilterNama}
            />
          </div>
          <div className="col-md-3"></div>
        </div>
        <div>
          {daftarMahasiswa}
        </div>
      </div>
    );
  }
}

export default ListMahasiswa;