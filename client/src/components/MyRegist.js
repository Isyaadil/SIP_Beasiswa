import React, { Component } from "react";
import Beasiswa from "../contracts/Beasiswa.json";
import getWeb3 from "../getWeb3";
import NavigationAdmin from './NavigationAdmin';
import Navigation from './Navigation';
import '../index.css';
import { FormGroup, FormControl, Button } from 'react-bootstrap';

class MyRegist extends Component {
  constructor(props) {
    super(props)

    this.state = {
      BeasiswaInstance: undefined,
      account: null,
      web3: null,
      RegistSaya: null,
      RegistSayaAll: null,
      dataDiriku: null,
      jmlPendaftar: null,
      isOwner: false
    }
  }

  doFilter = event => {
    var str = event.target.value;
    this.setState({ RegistSaya: null });        
    let filtered = [];
    for (let i = 0; i < this.state.RegistSayaAll.length; i++) {
      if (this.state.RegistSayaAll[i]['namaBeasiswa'].toLowerCase().includes(str.toLowerCase())) {
        filtered.push(this.state.RegistSayaAll[i]);
      }
    }
    this.setState({ RegistSaya: filtered });        
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

      // Mengambil data diri terlebih dahulu
      let dataDiriku = await this.state.BeasiswaInstance.methods.list_mahasiswa(this.state.account).call();        
      this.setState({ dataDiriku: dataDiriku });

    let jumlah_beasiswa = await this.state.BeasiswaInstance.methods.getSumBeasiswa().call();
    let daftar_beasiswa = [];
    for (let i = 0; i < jumlah_beasiswa; i++) {
        let beasiswa = await this.state.BeasiswaInstance.methods.List_Beasiswa(i).call();
        daftar_beasiswa.push(beasiswa);
    }
      
      //   Populasi pendaftaran saya
    let jumlahPendaftar = await this.state.BeasiswaInstance.methods.getSumAllPendaftar().call();
    let ListPendaftaranSaya = [];
      for (let i = 0; i < jumlahPendaftar; i++) {
        let detailPendaftar = await this.state.BeasiswaInstance.methods.list_mahasiswa_pendaftar(i).call();        
        if (detailPendaftar.id_mhs == this.state.account) {
            detailPendaftar.namaBeasiswa = daftar_beasiswa[detailPendaftar.beasiswa_id].judul;
            detailPendaftar.linkBeasiswa = daftar_beasiswa[detailPendaftar.beasiswa_id].main_link;
            ListPendaftaranSaya.push(detailPendaftar);
        }        
        // let id_mhs = await this.state.BeasiswaInstance.methods.Mhs(i).call();
        
      }
      this.setState({ RegistSaya: ListPendaftaranSaya });      
      this.setState({ RegistSayaAll: ListPendaftaranSaya });      


    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  render() {
    let myRegist = [];    
    if (this.state.RegistSaya) {
      console.log(this.state.RegistSaya);
      if (this.state.RegistSaya.length > 0) {
        for (let j = 0; j < this.state.RegistSaya.length; j++) {
          // SELEKSI Tombol Verif
          let tombol_verif = [];
          let alasan_verif = [];
          // pendaftaran.is_verified='1';
          if (this.state.RegistSaya[j].is_verified=='1') {
            tombol_verif.push(<Button className="btn btn-success">Anda Terverifikasi</Button>);
            tombol_verif.push(<p>Silakan Akses Link Berikut Untuk Melanjutkan Proses Pendaftaran.</p>);
            tombol_verif.push(<a class="nav-link h4 scrollto" target="_blank" href={`https:///${this.state.RegistSaya[j].linkBeasiswa}`}>{this.state.RegistSaya[j].linkBeasiswa}</a>);
            alasan_verif.push("Alasan Kelolosan : ");
            alasan_verif.push(this.state.RegistSaya[j].alasan);
          }else if(this.state.RegistSaya[j].is_verified=='2'){
            tombol_verif.push(<Button onClick={this.is_verified} value={this.state.RegistSaya[j].id_mhs} className="btn btn-danger">Maaf Anda Belum Lolos</Button>);                
            alasan_verif.push("Alasan Tidak Lolos : ");
            alasan_verif.push(this.state.RegistSaya[j].alasan);
          }else{
            tombol_verif.push(<Button onClick={this.is_verified} value={this.state.RegistSaya[j].id_mhs} className="btn btn-warning">Data Belum Diverifikasi</Button>);
          }

          myRegist.push(
            <div className="candidate">
              <div className="candidateName">{this.state.dataDiriku[1]}</div>
              <div className="CandidateDetails">
                <div>NIM : {this.state.dataDiriku[2]}</div>
                <div>Alamat : {this.state.dataDiriku[4]}</div>
                <div>IPK : {this.state.RegistSaya[j].ipk}</div>
                <div>ID Beasiswa : {this.state.RegistSaya[j].beasiswa_id}</div>
                <div>Nama Beasiswa : {this.state.RegistSaya[j].namaBeasiswa}</div>
              </div>

              <div className="CandidateDetails">
              {tombol_verif}
              </div>
              <div className="CandidateDetails">
              {alasan_verif}
              </div>
              <div><br></br></div>
            </div>
          );
        }
      }else{
        myRegist.push( 
        <div className="candidate">
          <div className="CandidateDetails">
            <h1>Belum ada data. <br></br> Silakan Lakukan Pendaftaran!</h1>
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
      <div>
        <div className="CandidateDetails">
        {this.state.isOwner ? <NavigationAdmin /> : <Navigation />}
          <div className="CandidateDetails-title">
            <h1>
              PENDAFTARAN SAYA
            </h1>
          </div>
        </div>

        <div className="row mt-4">
          <div className="col-md-4"></div>
          <div className="col-md-4">
            <FormControl 
              input='text' 
              placeholder='Filter Nama Beasiswa' 
              value={this.state.filter_beasiswa} 
              onChange={this.doFilter}
            />
          </div>
          <div className="col-md-4"></div>
        </div>

        <div>
          {myRegist}
        </div>
      </div>
    );
  }
}

export default MyRegist;