/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Object, Property } from 'fabric-contract-api';

@Object()
export class MedRecAsset {

    @Property()
    
    public ktp :string;
    public nama: string;
    public jenisKelamin: string;
    public email:string;
    public phone:string;
    public dob:string;
    public alamat : string;
    public maritalstatus: string;
    public komrobit:string;

    public reserveDate:string;
    public diagnose:any;
    public therapy:any;
    public drug:any;
    public registNumb:string;

    
    public faskesID:string;
    public faskesName:string;
    public noRM:any;
    public poli:string;
    public dokter:string;
    public alergi:any;
    public remark:string;
}
