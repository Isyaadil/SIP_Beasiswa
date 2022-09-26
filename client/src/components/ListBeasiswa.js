import React, { Component } from "react";
import Beasiswa from "../contracts/Beasiswa.json";
import getWeb3 from "../getWeb3";
import '../index.css';
import NavigationAdmin from './NavigationAdmin';
import Navigation from './Navigation';
import { Link } from 'react-router-dom';
import { FormGroup, FormControl, Button } from 'react-bootstrap';

class ListBeasiswa extends Component {
  constructor(props) {
    super(props)

    this.state = {
      BeasiswaInstance: undefined,
      account: null,
      web3: null,
      jumlah_beasiswa: 0,
      total_pelamar: 0,
      listBeasiswaFil: null,
      listBeasiswa: null,
      loaded: false,
      isOwner: false,
      statusterdaftar: []
    }
  }

  doFilter = event => {
    var str = event.target.value;
    this.setState({ listBeasiswaFil: null });        
    let filtered = [];
    for (let i = 0; i < this.state.listBeasiswa.length; i++) {
      if (this.state.listBeasiswa[i][1].toLowerCase().includes(str.toLowerCase())) {
        filtered.push(this.state.listBeasiswa[i]);
      }
    }
    this.setState({ listBeasiswaFil: filtered });        
  }

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
      
      this.setState({ BeasiswaInstance: instance, web3: web3, account: accounts[0] });

      let jumlah_beasiswa_ = await this.state.BeasiswaInstance.methods.getSumBeasiswa().call();
      this.setState({ jumlah_beasiswa: jumlah_beasiswa_ });

      let jumlah_pelamar_ = await this.state.BeasiswaInstance.methods.getSumAllPendaftar().call();
      this.setState({ jumlah_pelamar: jumlah_pelamar_ });

      let daftar_beasiswa = [];
      let stateterdaftar = [];
      for (let i = 0; i < jumlah_beasiswa_; i++) {
        let beasiswa = await this.state.BeasiswaInstance.methods.List_Beasiswa(i).call();
        var terdaftar = await this.state.BeasiswaInstance.methods.cek_regist_exist(this.state.account, i).call();
        daftar_beasiswa.push(beasiswa);
        stateterdaftar.push(terdaftar);
      }

      this.setState({ listBeasiswa: daftar_beasiswa });
      this.setState({ listBeasiswaFil: daftar_beasiswa });
      this.setState({ statusterdaftar: stateterdaftar });

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
    let daftarBeasiswa;
    if (this.state.listBeasiswaFil) {
      // daftarBeasiswa = this.state.listBeasiswa.map((Data_Beasiswa) => {
      // console.log(this.state.listBeasiswaFil);
      daftarBeasiswa = this.state.listBeasiswaFil.map((Data_Beasiswa) => {
        var sisa_kuota = Data_Beasiswa.kuota - Data_Beasiswa.jumlah_pendaftar;
        return (
          <div className="candidate">
            <div className="candidateName">
              {Data_Beasiswa.judul} || 
              {
              this.state.isOwner ? (
                <Link to={`VerifyRegist/${Data_Beasiswa.id}`}> Verifikasi Pendaftar </Link> 
              ) : (
                this.state.statusterdaftar[Data_Beasiswa.id] ? (
                  <span className="text-success"> Anda Sudah Mendaftar Beasiswa Ini</span>
                ) : (
                  sisa_kuota > 0 ? (
                    <Link to={`RegistBeasiswa/${Data_Beasiswa.id}`}> Lamar Beasiswa</Link>
                  ) : (
                    <span className="text-danger"> Kuota Sudah Terpenuhi </span>
                  )
                )
              )}
            </div>
            <div className="CandidateDetails">
              <div>Deskripsi : {Data_Beasiswa.deskripsi}</div>
              <div>
                Kuota Pelamar : {Data_Beasiswa.kuota}
                <br></br> 
                {this.state.isOwner ? "Jumlah Pelamar : " + Data_Beasiswa.jumlah_pendaftar : "Kuota Tersisa : " + sisa_kuota }                
              </div>
              <div>                
                {this.state.isOwner ? "Link Utama :" + Data_Beasiswa.main_link : ""}
              </div>
              <div>Kode Beasiswa : {Data_Beasiswa.id}</div>
            </div>
          </div>
        );
      });
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
            {this.state.isOwner ? "KELOLA BEASISWA || " : "INFO BEASISWA"}            
            {this.state.isOwner ? <Link to='/AddBeasiswa' className="btn btn-md btn-primary">Tambah Beasiswa</Link> : ""}            
          </h1>
        </div>


        <div className="section-title">
          <h3>Total Jumlah Beasiswa : <span>{this.state.jumlah_beasiswa}</span></h3>
          {this.state.isOwner ? <h3>Total Jumlah Pelamar : <span>{this.state.jumlah_pelamar}</span></h3>: ""}                              
        </div>
        <div className="row">
          <div className="col-md-4"></div>
          <div className="col-md-4">
            <FormControl 
              input='text' 
              placeholder='Filter Nama Beasiswa' 
              value={this.state.filterStr} 
              onChange={this.doFilter}
            />
          </div>
          <div className="col-md-4"></div>
        </div>
        <div>
          {daftarBeasiswa}
        </div>
      </div>
    );
  }
}

export default ListBeasiswa;