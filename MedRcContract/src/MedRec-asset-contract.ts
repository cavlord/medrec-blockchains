/*
 * SPDX-License-Identifier: Apache-2.0
 */
import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { MedRecAsset } from './MedRec-asset';


@Info({ title: 'MedRecAssetContract', description: 'My Smart Contract' })
export class MedRecAssetContract extends Contract {

    // add sample transaction
    // @Transaction()
    // public async initLedger(ctx: Context) {
    //    const data : MedRecAsset [] =[
    //         {
                
    //             nama:'Fahmi',
    //             jenisKelamin: 'Pria',
    //             alamat:'Jl Jendral Sudirman no 1',
    //             status: '',
    //             cert :uuid(),
    //             tglvac:'',
    //             fac:'',
    //             remark:''
    //         },
    //         {
    //             nama:'Mifah',
    //             jenisKelamin: 'Pria',
    //             alamat:'Jl Jendral Sudirman no 2',
    //             status: '',
    //             cert :uuid(),
    //             tglvac:'',
    //             fac:'',
    //             remark:''
    //         },
    //         {
             
    //             nama: 'Imfha',
    //             jenisKelamin: 'Wanita',
    //             alamat:'Jl Jendral Sudirman no 3',
    //             status: '',
    //             cert :uuid(),
    //             tglvac:'',
    //             fac:'',
    //             remark:''
    //         },
    //         {

    //             nama: 'Ahmif',
    //             jenisKelamin: 'Wanita',
    //             alamat:'Jl Jendral Sudirman no 4',
    //             status: '',
    //             cert :uuid(),
    //             tglvac:'',
    //             fac:'',
    //             remark:''
    //         }
    //     ]

    //     for (let i = 0; i < data.length; i++) {
    //         await ctx.stub.putState('0'+ i, Buffer.from(JSON.stringify(data[i])));
            
    //     }
        
    // }

    @Transaction(false)
    @Returns('boolean')
    public async MedRecAssetExist(ctx: Context, NOBPJS: string): Promise<boolean> {
        const buffer = await ctx.stub.getState(NOBPJS);
        return (!!buffer && buffer.length > 0);
    }

    @Transaction()
    public async createMedRecAsset(ctx: Context, NOBPJS: string,ktp:string,email:string,phone:string, nama: string,dob:string, jenisKelamin :string ,alamat:string ,maritalstatus: string,
    ): Promise<void> {
    //    const hasAccess = await this.hasRole(ctx, ['Gov']);
    //     if (!hasAccess) {
    //         throw new Error(`Only Gov can create medRec asset`);
    //     }
        const exists = await this.MedRecAssetExist(ctx, NOBPJS);
        if (exists) {
            throw new Error(`The medRec asset ${NOBPJS} already exists`);
        }
        const medRecAsset = new MedRecAsset();
        medRecAsset.ktp = ktp;
        medRecAsset.nama = nama;
        medRecAsset.reserveDate = "";
        medRecAsset.jenisKelamin = jenisKelamin;
        medRecAsset.dob = dob;
        medRecAsset.alamat = alamat;
        medRecAsset.email = email;
        medRecAsset.phone = phone;
        medRecAsset.maritalstatus = maritalstatus;
        medRecAsset.komrobit = "";

        medRecAsset.registNumb = "";
        medRecAsset.faskesID = "";
        medRecAsset.faskesName= "";
        medRecAsset.noRM = "";
        medRecAsset.poli = "";
        medRecAsset.dokter = "";
        medRecAsset.diagnose =[];
        medRecAsset.therapy= [];
        medRecAsset.drug =[];
        medRecAsset.alergi=[];
        //medRecAsset.whitelist =[];
        const buffer = Buffer.from(JSON.stringify(medRecAsset));
        await ctx.stub.putState(NOBPJS, buffer);
        const transientMap = ctx.stub.getTransient();
        if (transientMap.get("remark")) {
            await ctx.stub.putPrivateData("GovRemark",NOBPJS,transientMap.get("remark"));
        }
    }

    @Transaction(false)
    @Returns('MedRecAsset')
    public async readMedRecAsset(ctx: Context, NOBPJS: string): Promise<MedRecAsset> {
        const exists = await this.MedRecAssetExist(ctx, NOBPJS);
        if (!exists) {
            throw new Error(`The medRec asset ${NOBPJS} does not exist`);
        }
        const buffer = await ctx.stub.getState(NOBPJS);
        const medRecAsset = JSON.parse(buffer.toString()) as MedRecAsset;
     try {
            const privBuffer = await ctx.stub.getPrivateData("GovRemark",NOBPJS);
            medRecAsset.remark = privBuffer.toString();
            return medRecAsset;
        } catch (error) {
            return medRecAsset;
        }
    }

    
    @Transaction()
    public async MedReservation(ctx: Context,NOBPJS:string, newfaskesID:string, newfaskesName:string,newpoli:string, newreserveDate:string,newregistNumb:string) {
        const ktpAsBytes = await ctx.stub.getState(NOBPJS); 
        if (!ktpAsBytes || ktpAsBytes.length === 0) {
            throw new Error(`${NOBPJS} does not exist`);
        }

        const medRecAsset: MedRecAsset = JSON.parse(ktpAsBytes.toString());
        
        medRecAsset.faskesID = newfaskesID,
        medRecAsset.faskesName= newfaskesName,
        medRecAsset.poli= newpoli,
        medRecAsset.reserveDate = newreserveDate;
        medRecAsset.registNumb = newregistNumb;
        await ctx.stub.putState(NOBPJS, Buffer.from(JSON.stringify(medRecAsset)));
        
    }

    @Transaction(false)
    public async MedReserveConfirm(ctx: Context, registNumb: string): Promise<string> {
        const query = { selector: { registNumb } };
        const queryString = JSON.stringify(query);
        const iterator = await ctx.stub.getQueryResult(queryString);
        const allResults = [];
        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString());

                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString());
                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString();
                }
                allResults.push({ Key, Record });
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return JSON.stringify(allResults);
            }
        }
    }

    @Transaction(false)
    public async HospitalPatientList(ctx: Context, faskesID: string): Promise<string> {
        
        const query = { selector: { faskesID } };
        const queryString = JSON.stringify(query);
        const iterator = await ctx.stub.getQueryResult(queryString);
        const allResults = [];
        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString());

                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString());
                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString();
                }
                allResults.push({ Key, Record });
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return JSON.stringify(allResults);
            }
        }
    }


    @Transaction()
    public async AssignDokter(ctx: Context,NOBPJS:string,dokter:string) {
        const ktpAsBytes = await ctx.stub.getState(NOBPJS); 
        if (!ktpAsBytes || ktpAsBytes.length === 0) {
            throw new Error(`${NOBPJS} does not exist`);
        }

        const medRecAsset: MedRecAsset = JSON.parse(ktpAsBytes.toString());
        medRecAsset.dokter = dokter
        medRecAsset.noRM = `${medRecAsset.faskesID}-${medRecAsset.ktp}`
        await ctx.stub.putState(NOBPJS, Buffer.from(JSON.stringify(medRecAsset)));
        
    }

    @Transaction()
    public async Diagnose(ctx: Context,NOBPJS:string, diagnoseID:string, diagnoseName:string) {
        const ktpAsBytes = await ctx.stub.getState(NOBPJS); 
        if (!ktpAsBytes || ktpAsBytes.length === 0) {
            throw new Error(`${NOBPJS} does not exist`);
            }
        const medRecAsset: MedRecAsset = JSON.parse(ktpAsBytes.toString());
               medRecAsset.diagnose.push({diagnoseID,diagnoseName})
       
       
        await ctx.stub.putState(NOBPJS, Buffer.from(JSON.stringify(medRecAsset)));
        
    }
    
    @Transaction()
    public async Therapy(ctx: Context,NOBPJS:string, diagnoseID:string,therapyID:string, therapyName:string) {
        const ktpAsBytes = await ctx.stub.getState(NOBPJS); 
        if (!ktpAsBytes || ktpAsBytes.length === 0) {
            throw new Error(`${NOBPJS} does not exist`);
            }
        const medRecAsset: MedRecAsset = JSON.parse(ktpAsBytes.toString());
               medRecAsset.therapy.push({diagnoseID,therapyID,therapyName})
       
       
        await ctx.stub.putState(NOBPJS, Buffer.from(JSON.stringify(medRecAsset)));
        
    }

    
    @Transaction()
    public async drug(ctx: Context,NOBPJS:string, diagnoseID:string,therapyID:string,drugID:string,drugName:string) {
        const ktpAsBytes = await ctx.stub.getState(NOBPJS); 
        if (!ktpAsBytes || ktpAsBytes.length === 0) {
            throw new Error(`${NOBPJS} does not exist`);
            }
        const medRecAsset: MedRecAsset = JSON.parse(ktpAsBytes.toString());
               medRecAsset.drug.push({diagnoseID,therapyID,drugID,drugName})
       
       
        await ctx.stub.putState(NOBPJS, Buffer.from(JSON.stringify(medRecAsset)));
        
    }


    // @Transaction()
    // public async updateMedRecAsset(ctx: Context, NOBPJS: string, nama: string, jenisKelamin :string ,alamat:string ,status: string,cert:string, tglvac:string, fac:string): Promise<void> {
    //     const hasAccess = await this.hasRole(ctx, ['Gov','Facilitator']);
    //     if (!hasAccess) {
    //         throw new Error(`Only Gov and Facilitator can update car asset`);
    //     }
    //     const exists = await this.MedRecAssetExist(ctx, NOBPJS);
    //     if (!exists) {
    //         throw new Error(`The medRec asset ${NOBPJS} does not exist`);
    //     }
    //     const medRecAsset = new MedRecAsset();
    //     medRecAsset.nama = nama;
    //     medRecAsset.jenisKelamin = jenisKelamin;
    //     medRecAsset.alamat = alamat;
    //     medRecAsset.maritalstatus = status;
    //     medRecAsset.cert = cert;
    //     medRecAsset.tglvac = tglvac;
    //     medRecAsset.fac = fac;
    //     const buffer = Buffer.from(JSON.stringify(medRecAsset));
    //     await ctx.stub.putState(NOBPJS, buffer);
    // }

    @Transaction()
    public async deleteMedRecAsset(ctx: Context, NOBPJS: string): Promise<void> {
        // const hasAccess = await this.hasRole(ctx, ['Gov']);
        // if (!hasAccess) {
        //     throw new Error(`Only dealer can delete car asset`);
        // }
        const exists = await this.MedRecAssetExist(ctx, NOBPJS);
        if (!exists) {
            throw new Error(`The medRec asset ${NOBPJS} does not exist`);
        }
        await ctx.stub.deleteState(NOBPJS);
    }

   

    @Transaction(false)
    public async queryAllAssets(ctx: Context): Promise<string> {
        const startKey = '000';
        const endKey = '999';
        const iterator = await ctx.stub.getStateByRange(startKey, endKey);
        const allResults = [];
        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString());

                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString());
                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString();
                }
                allResults.push({ Key, Record });
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return JSON.stringify(allResults);
            }
        }
    }
   
    @Transaction(false)
    public async getHistoryByKey(ctx: Context, NOBPJS: string): Promise<string> {
        const iterator = await ctx.stub.getHistoryForKey(NOBPJS);
        const allResults = [];
        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString());

                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString());
                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString();
                }
                allResults.push({ Record });
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return JSON.stringify(allResults);
            }
        }
    }
   
    // @Transaction()
    // public async changeStatus(ctx: Context,NOBPJS:string, newstatus:string, newcert:string, newtglvac:string, newfac:string) {
    //     const ktpAsBytes = await ctx.stub.getState(NOBPJS); 
    //     if (!ktpAsBytes || ktpAsBytes.length === 0) {
    //         throw new Error(`${NOBPJS} does not exist`);
    //     }
    //     const medRecAsset: MedRecAsset = JSON.parse(ktpAsBytes.toString());
    //     medRecAsset.maritalstatus = newstatus; 
    //     medRecAsset.cert = newcert;       
    //     medRecAsset.tglvac = newtglvac;
    //     medRecAsset.fac = newfac;
    //     await ctx.stub.putState(NOBPJS, Buffer.from(JSON.stringify(medRecAsset)));
        
    // }



    // public async hasRole(ctx: Context, roles: string[]) {
    //     const clientID = ctx.clientIdentity;
    //     for (const roleName of roles) {
    //         if (clientID.assertAttributeValue('role', roleName)) {
    //             if (clientID.getMSPID() === 'Org1MSP' && clientID.getAttributeValue('role') === 'Gov') { return true; }
    //             if (clientID.getMSPID() === 'Org2MSP' && clientID.getAttributeValue('role') === 'Facilitator') { return true; }
    //         }
    //     }
    //     return false;
    //     }
}

    


