function _1(md){return(
md`# validity`
)}

function _files(FileAttachment){return(
{
  "hadoop": FileAttachment("validity_hadoop@1.csv"),
  "flink": FileAttachment("validity_flink@1.csv"),
  "netty": FileAttachment("validity_netty@2.csv"),
  "javaparser": FileAttachment("validity_javaparser@1.csv"),
  "spark": FileAttachment("validity_spark@1.csv"),
  "spoon": FileAttachment("validity_spoon@1.csv"),
  "quarkus": FileAttachment("validity_quarkus@2.csv"),
  "logging-log4j": FileAttachment("validity_logging-log4j2@1.csv"),
  "maven": FileAttachment("validity_maven@1.csv"),
  "jenkins": FileAttachment("validity_jenkins@1.csv"),
  "gson": FileAttachment("validity_gson@1.csv"),
  "arthas": FileAttachment("validity_arthas@1.csv"),
  "dubbo": FileAttachment("validity_dubbo@1.csv"),
  "fastjson": FileAttachment("validity_fastjson@1.csv"),
  "guava": FileAttachment("validity_guava@1.csv"),
  "skywalking": FileAttachment("validity_skywalking@1.csv"),
  "slf4j": FileAttachment("validity_slf4j@1.csv"),
  "jackson-core": FileAttachment("validity_jackson-core@1.csv"),
  "aws-toolkit-eclipse": FileAttachment("validity_aws-toolkit-eclipse@1.csv"),
}
)}

function _process_file(process_entry){return(
async function process_file ([project, fa]) { 
  const f = await fa.csv({typed: true})
  return [...f.map(x => process_entry(project,x))]
}
)}

function _process_entry(){return(
function process_entry (project, entry) { 
  return {
    ...entry, 
    project,
  }
}
)}

function _5(d3,data){return(
d3.mean(data.map(d=>(18446744073709551615-d.gt_src_heap)/d.src_s))
)}

function _6(data){return(
data.map(d=>d.gt_src_heap).filter(x=>x>18400000000000000000)
)}

function _7(data){return(
Math.min(...data.map(d=>d.gt_src_heap))
)}

function _mean_gt_heap(data){return(
data.filter(d=>d.gt_src_heap>-1).map(d=>(d.gt_src_heap> 18400000000000000000 ? 18446744073709551615-d.gt_src_heap : d.gt_src_heap)/d.src_s)
)}

function _9(mean_gt_heap){return(
mean_gt_heap.filter(x=>x<70)
)}

function _10(d3,mean_gt_heap){return(
d3.format("~s")(d3.mean(mean_gt_heap)) + "b"
)}

function _hast_heap(data){return(
data.map(d=>d.hast_src_heap>0?d.hast_src_heap/d.src_s:0)
)}

function _12(hast_heap){return(
hast_heap.filter(x=>x>1)
)}

function _13(d3,hast_heap){return(
d3.mean(hast_heap)
)}

function _14(){return(
1/8
)}

function _hast_pp_heap(d3,data){return(
d3.rollup(data, l=>d3.mean(l.map(d=>d.hast_src_heap>0?d.hast_src_heap/d.src_s:0)), d=>d.project)
)}

function _hast_pp_0_10_heap(d3,data){return(
d3.rollup(data, l=>d3.mean(l.slice(0,10).map(d=>d.hast_src_heap>0?d.hast_src_heap/d.src_s:0)), d=>d.project)
)}

function _hast_pp_0_100_heap(d3,data){return(
d3.rollup(data, l=>d3.mean(l.slice(0,10).map(d=>d.hast_src_heap>0?d.hast_src_heap/d.src_s:0)), d=>d.project)
)}

function _18(d3,data){return(
d3.rollup(data, l=> {
  let ll = l.slice(0,20).map(d=>({
    hast:(d.hast_src_heap>0 ? d.hast_src_heap/d.src_s : 0),
    gt: (d.gt_src_heap<0 ? NaN
                         :(d.gt_src_heap> 18400000000000000000 ? 18446744073709551615-d.gt_src_heap
                                                               : d.gt_src_heap)/d.src_s)}))
  return {
    hast: d3.mean(ll,d=>d.hast),
    gt: d3.mean(ll,d=>d.gt)}
}, d=>d.project)
)}

function _min_max_ratio(d3,data){return(
d3.rollup(data, l=> {
  let hast_src_heap = 0
  let ll = l.slice(0,l.length/20).map(d=>{
    hast_src_heap += d.hast_src_heap>0 ? d.hast_src_heap : 0
    return {...d, aaa: d.hast_src_heap, hast_src_heap:hast_src_heap}
  })
  return ll.map(d=>[d.hast_src_heap,d.gt_src_heap> 18400000000000000000 ? 18446744073709551615-d.gt_src_heap
                                                               : d.gt_src_heap])
    ll=ll.map(d=>({
    hast:(d.hast_src_heap+(d.hast_dst_heap>0 ? d.hast_dst_heap : 0))/(d.src_s+d.dst_s),
    gt: ((d.gt_src_heap<0 ? NaN
                         :(d.gt_src_heap> 18400000000000000000 ? 18446744073709551615-d.gt_src_heap
                                                               : d.gt_src_heap))+
  (d.gt_dst_heap<0 ? NaN
                         :(d.gt_dst_heap> 18400000000000000000 ? 18446744073709551615-d.gt_dst_heap
                                                               : d.gt_dst_heap)))/(d.src_s+d.dst_s)}))
  // let lll = ll.filter(d=>d.gt>0 && d.hast>0).map(d=>rel_diff(d.gt,d.hast))
  return ll
  let lll = ll.filter(d=>d.gt>0 && d.hast>0).map(d=>d.gt/d.hast)
  return lll
  return {
    min: d3.min(lll),
    max: d3.max(lll)}
}, d=>d.project).get("dubbo")
)}

function _20(d3,min_max_ratio){return(
d3.min(min_max_ratio.values(), d=>d.min)
)}

function _21(d3,min_max_ratio){return(
d3.max(min_max_ratio.values(), d=>d.max)
)}

function _rel_diff(){return(
(ref,x)=> {
  // const d = diff(ref,x);
  // return d/(Math.min(a,b)+d/2)
  return (x-ref)/Math.abs(ref)
}
)}

function _23(d3,data){return(
d3.mean(data.map(d=>({
    hast:(d.hast_src_heap>0 ? d.hast_src_heap/d.src_s : 0),
    gt: (d.gt_src_heap<0 ? NaN
                         :(d.gt_src_heap> 18400000000000000000 ? 18446744073709551615-d.gt_src_heap
                                                               : d.gt_src_heap)/d.src_s)}))
, d=>d.hast)
)}

function _ratioed_heaps(d3,data){return(
[...d3.rollup(data, l=> {
  let f = l => l.map(d=>({
    hast:(d.hast_src_heap>0 ? d.hast_src_heap/d.src_s : 0) + (8 + 4 + 4)*2 + 1/8 + 1/8,
    gt: (d.gt_src_heap<0 ? NaN
                         :(d.gt_src_heap> 18400000000000000000 ? 18446744073709551615-d.gt_src_heap
                                                               : d.gt_src_heap)/d.src_s)}))
  return {
    heap : [...[...Array(l.length).keys()]
      
      //1,2,3,4,8,16,20,32,
      // 64,90,
      // 100, 120,
      //       128//,128*2,400,128*4,700,990
            ].map(i=> {
     let ll = f(l.slice(0,i))
    // let wedfg = ll.filter(x=>!isNaN(x.gt))
    // if (wedfg.length > 0 && ll.length > 0)
    // console.log(wedfg)
      return {
        i,
        hast: d3.mean(ll,d=>d.hast),
        gt: d3.mean(ll.filter(x=>!isNaN(x.gt)||!(x.gt>0)).map(d=>d.gt)) }
    }),
    project:l[0].project}
}, d=>d.project).values()]
)}

function _25(d3,data){return(
[...d3.rollup(data.filter(x=>x.project==="aws-toolkit-eclipse"), l=> {
  let f = l => l.map(d=>({
    hast:(d.hast_src_heap>0 ? d.hast_src_heap/d.src_s : 0) + (8 + 4 + 4)*1 + 1/8,
    gt: (d.gt_src_heap<0 ? NaN
                         :(d.gt_src_heap> 18400000000000000000 ? 18446744073709551615-d.gt_src_heap
                                                               : d.gt_src_heap)/d.src_s)}))
  return {
    heap : [...[...Array(l.length).keys()]
      
      //1,2,3,4,8,16,20,32,
      // 64,90,
      // 100, 120,
      //       128//,128*2,400,128*4,700,990
            ].map(i=> {
     let ll = f(l.slice(0,i))
    // let wedfg = ll.filter(x=>!isNaN(x.gt))
    // if (wedfg.length > 0 && ll.length > 0)
    // console.log(wedfg)
      return {
        i,
        hast: d3.mean(ll,d=>d.hast),
        gt: d3.mean(ll.filter(x=>!isNaN(x.gt)||!(x.gt>0)).map(d=>d.gt)) }
    }),
    project:l[0].project}
}, d=>d.project).values()]
)}

function _data2(ratioed_heaps){return(
ratioed_heaps.map(x=>x.heap.map((a=>({project:x.project, ...a})))).flat()
)}

function _data3(data2){return(
[
  ...data2.map(x=>({project:x.project,kind:"hast",heap:x.hast,i:x.i})),
  ...data2.map(x=>({project:x.project,kind:"gt",heap:x.gt,i:x.i}))
           ]
)}

function _data4(d3,data2){return(
[...d3.rollup(data2//.filter(x=>x.project!=="aws-toolkit-eclipse")
                      ,d=>({
  i:d[0].i,
  hast:d3.mean(d.map(d=>d.hast).filter(d=>d!==undefined)),
  gt:d3.mean(d.map(d=>d.gt).filter(d=>d!==undefined))
}),d=>d.i).values()]
)}

function _data5(data4){return(
[
  ...data4.map(x=>({kind:"hast",heap:x.hast,i:x.i})),
  ...data4.map(x=>({kind:"gt",heap:x.gt,i:x.i}))
           ]
)}

function _30(Plot,data5){return(
Plot.plot({
  color: {
    legend: true
  },
  x: {
    type: "log"
  },
  y: {
    type: "log"
  },
  marks: [
    // Plot.ruleY([0]),
    Plot.ruleY([32.4]),
    Plot.lineX(data5, {
      x: "i",
      y: "heap",
      stroke: "kind",
      z: "project",
      // filter: d=> d.heap!==undefined,
      // strokeDasharray: d=>d.kind==="hast"?[5,5]:[],
      // stroke: d => d.project,//d["project"] + "-" + d.i,
      // sort: {x:{value: d=>d.kind==="hast"?1:-1, order: "descending", reverse: true}},
    })
  ]
})
)}

function _31(Plot,data3){return(
Plot.plot({
  color: {
    legend: true
  },
  x: {
    // type: "log"
  },
  facets: {
    data: data3,
    y: "project"
  },
  marks: [
    // Plot.ruleY([0]),
    Plot.lineX(data3, {
      x: "i",
      y: "heap",
      stroke: "kind",
      title: d=>d.project,
      // filter: d=> d.heap!==undefined,
      // strokeDasharray: d=>d.kind==="hast"?[5,5]:[],
      // stroke: d => d.project,//d["project"] + "-" + d.i,
      // sort: {x:{value: d=>d.kind==="hast"?1:-1, order: "descending", reverse: true}},
    })
  ]
})
)}

function _32(Plot,data3){return(
Plot.plot({
  marks: [
    Plot.areaY(data3, Plot.binX({
      y1: "mean", y2: "max",
    },{
      x: "i", y1: "heap", y2: "heap",
      // filter: d=> d.kind==="gt",
      fill: "kind",
      sort: {x:{channel: "x", order: "descending"}},
    }))
  ]
})
)}

function _33(Plot,data3){return(
Plot.plot({
  color: {
    legend: true
  },
  // x: {
  //   type: "log"
  // },
  facet: {
    data: data3,
    x:"i"
  },
  marks: [
    Plot.barY(data3, {
      x: "project",
      y: "heap",
      fill: "kind",
      // z: "kind",
      // filter: d=> d.kind==="hast",
      // strokeDasharray: d=>d.kind==="hast"?[5,5]:[],
      // stroke: d => d.project,//d["project"] + "-" + d.i,
      // sort: {channel: "x", order: "descending"},
    })
  ]
})
)}

function _34(Plot,data3){return(
Plot.plot({
  color: {
    legend: true
  },
  // y: {
  //   type: "log"
  // },
  facet: {
    data: data3,
    x:"i"
  },
  marks: [
    Plot.barY(data3, {
      x: "project",
      // y: d=>d.heap*d.i,
      y:"heap",
      fill: "kind",
      // z: "kind",
      filter: d=> d.kind==="hast",
      // strokeDasharray: d=>d.kind==="hast"?[5,5]:[],
      // stroke: d => d.project,//d["project"] + "-" + d.i,
      // sort: {channel: "x", order: "descending"},
    })
  ]
})
)}

function _35(Plot,data3){return(
Plot.plot({
  color: {
    legend: true
  },
  // x: {
  //   type: "log"
  // },
  facet: {
    data: data3,
    x:"i"
  },
  marks: [
    Plot.barY(data3, {
      x: "project",
      y: d=>d.heap*d.i,
      fill: "kind",
      // z: "kind",
      filter: d => d.kind==="gt",
      // strokeDasharray: d=>d.kind==="hast"?[5,5]:[],
      // stroke: d => d.project,//d["project"] + "-" + d.i,
      // sort: {channel: "x", order: "descending"},
    })
  ]
})
)}

function _hast_pp_10_heap(d3,data){return(
d3.rollup(data, l=>d3.mean(l.slice(10).map(d=>d.hast_src_heap>0?d.hast_src_heap/d.src_s:0)), d=>d.project)
)}

function _37(hast_heap){return(
hast_heap.filter(x=>x>70)
)}

async function _data(files,process_file){return(
(await Promise.all([...
    Object
    .entries(files)
    .map(process_file)
])).flat()
)}

function _39(d3,data){return(
d3.group(data,d=>d.missing_mappings)
)}

function _40(d3,data){return(
d3.group(data,d=>d.additional_mappings)
)}

function _41(d3,data){return(
d3.group(data,d=>d.additional_mappings,d=>d.project)
)}

function _42(d3,data){return(
d3.group(data.filter(d=>d.gt_c>-1),d=>d.hast_c-d.gt_c)
)}

function _43(data){return(
data.filter(d=>d.gt_c>-1)
)}

function _44(data){return(
data.filter(d=>d.hast_c<0 && d.gt_m>-1)
)}

function _45(d3,data){return(
d3.group(data.filter(d=>d.not_lazy_m!==d.hast_m),d=>d.project)
)}

function _46(d3,data){return(
d3.group(data.filter(d=>d.gt_m>-1 && d.not_lazy_m!==d.gt_m),d=>d.project)
)}

function _invalid_mappings(data){return(
data.filter(d=>d.additional_mappings>0||d.missing_mappings>0
                ||(d.hast_c<0 && d.gt_c>-1 && d.gt_m>-1)
               )
)}

function _48(invalid_mappings){return(
invalid_mappings.map(d=>({gt_c:d.gt_c,gt_m:d.gt_m,a_m:d.additional_mappings,m_m:d.missing_mappings,p:d.project,d}))
)}

function _invalid_changes(data){return(
data.filter(d=>d.gt_c>-1 && d.gt_m>-1 && d.hast_c!==d.gt_c)
)}

function _50(d3,data){return(
d3.group(data,d=>d.project)
)}

function _51(data){return(
data.filter(d=>
                (d.hast_m<0 && d.gt_m>-1)
               )
)}

function _52(data){return(
data.filter(d=>
                (d.hast_c<0)
               )
)}

function _53(data){return(
data.filter(d=>
                (d.hast_c<0 && d.gt_c>-1 && d.gt_m>-1)
               )
)}

function _54(data){return(
data.filter(d=>
                d.additional_mappings>0
             && d.missing_mappings===0
               )
)}

function _55(d3,data){return(
100-d3.mean(data.filter(d=>
                d.additional_mappings>0
             && d.missing_mappings===0
               ).map(d=>d.additional_mappings/d.hast_m))*100
)}

function _56(d3,data){return(
d3.mean(data.filter(d=>
                d.additional_mappings>0
             && d.missing_mappings===0
               ).map(d=>d.additional_mappings))
)}

function _57(d3,data){return(
d3.mean(data.filter(d=>
                d.additional_mappings>0
             && d.missing_mappings===0
               ).map(d=>d.hast_m))
)}

function _58(data){return(
data.filter(d=>
                d.missing_mappings>0
             && d.additional_mappings===0
               )
)}

function _59(data){return(
data.filter(d=>
                d.missing_mappings>0
             && d.additional_mappings===0
               ).map(d=>d.gt_m)
)}

function _invalid_results(data){return(
data.filter(d=>
                   d.additional_mappings>0
                || d.missing_mappings>0
                || (d.hast_c<0 && d.gt_c>-1 && d.gt_m>-1)
                || (d.gt_c>-1 && d.gt_m>-1 && d.hast_c!==d.gt_c)
               )
)}

function _61(invalid_results,invalid_mappings){return(
invalid_results.filter(d=>!invalid_mappings.some(e=>d.input==e.input))
)}

function _62(data){return(
data.length
)}

function _validity_ratio(invalid_results,data){return(
100-invalid_results.length/data.length*100
)}

function _mappings_validity_ratio(invalid_mappings,data){return(
100-invalid_mappings.length/data.length*100
)}

function _65(d3,data){return(
d3.group(data.filter(d=>d.gt_m>-1),d=>d.project)
)}

function _66(d3,data){return(
d3.sum(data.filter(d=>d.gt_m>-1),d=>d.gt_m)
)}

function _67(d3,data){return(
d3.sum(data.filter(d=>d.gt_m>-1),d=>d.missing_mappings+d.additional_mappings)/d3.sum(data.filter(d=>d.gt_m>-1),d=>d.gt_m)
)}

function _68(Plot,data){return(
Plot.plot({
  marginLeft:150,
  marks: [
    Plot.dot(data, {
      x: "input", 
      // y: "hast_src_heap", 
      y: "gt_src_heap", 
      // filter: d=>d.missing_mappings>0,
      sort: {x: "y", reverse: true}
    }),
    // Plot.ruleY([0])
  ]
})
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["validity_aws-toolkit-eclipse@1.csv", {url: new URL("./files/3ce874c690b09d74f47edefb7758999f607933a29b652235927fa2b0017405404f301ce7dc0023ace6bd59fc1331997ad9799d5360786ae106a188d302198269.csv", import.meta.url), mimeType: "text/csv", toString}],
    ["validity_guava@1.csv", {url: new URL("./files/c725cdb49a72e77c19021202de09930d123343f8a9a4757606a7b1afb87251951befc6877ac79f5a84adef089ea8f2fff60ed746c3053183eabdd389371d55b1.csv", import.meta.url), mimeType: "text/csv", toString}],
    ["validity_javaparser@1.csv", {url: new URL("./files/99b005c701ee045e8e965a3b70802b5b9f67b83e3f155a2dd0e2c63d8ff2350934e683a26b60144089e0f14c565dfd8acddd7d2a2e6fdc8680e6d781e618fd15.csv", import.meta.url), mimeType: "text/csv", toString}],
    ["validity_arthas@1.csv", {url: new URL("./files/17f9d0e69bcf2b85d4ac072c9c9a9f27c32fba00e66474e1a033c4ed6ccd612645076b9c5e8c545d8c352b78f1cc5978bced166a4331dfdaeb46e367aed97af0.csv", import.meta.url), mimeType: "text/csv", toString}],
    ["validity_dubbo@1.csv", {url: new URL("./files/342be29f9ae781071c1cccdf76c370e9853a4da86644886e44f315417f784b9e297e30e84364f819dc41f6feaae3f13e684f3dfbfc347de68884431ac71abae7.csv", import.meta.url), mimeType: "text/csv", toString}],
    ["validity_spoon@1.csv", {url: new URL("./files/d91b28fa7162bb2eb85ea05c330f5939f54dd0391edda9be39ccabd24db5b7a497018bb8349d5fa7ef7f510eaefca0b29ffa1d80eb8eea10d047cf92d81fee5a.csv", import.meta.url), mimeType: "text/csv", toString}],
    ["validity_fastjson@1.csv", {url: new URL("./files/8070a28f4e402102e72204219476d5ee00adf71bc0a55f1f567dd523088b4311fbb1cbc32bc85b8882191b0c20dc3c3093621927017b96bb6f968fef518b427b.csv", import.meta.url), mimeType: "text/csv", toString}],
    ["validity_logging-log4j2@1.csv", {url: new URL("./files/c42139239fba1d6abadc561cd56e34c8782c4fafefdf1b79b299bc08fc98e14d9e5cd7252fb947215fccaacddd5a80db2f681d29c1929547cb850aebdf7c8032.csv", import.meta.url), mimeType: "text/csv", toString}],
    ["validity_skywalking@1.csv", {url: new URL("./files/455d38da3b8d23ad23318059b7e449a7ce7683829b89fa3d61de46fa8b5011bce3d55b6ce5a84bd99064ca68cb78690454f44f53b55cff0cc718d24ae9354c29.csv", import.meta.url), mimeType: "text/csv", toString}],
    ["validity_jackson-core@1.csv", {url: new URL("./files/ece85d61dbb49ead6f891be34c74a5308aa2fb5d6f1960e91709ab316a3bbd7516bf0de0769295cffa3d6893241fe418f71d2e7b0d16206961d239dd0f424914.csv", import.meta.url), mimeType: "text/csv", toString}],
    ["validity_spark@1.csv", {url: new URL("./files/bc1fc238881bace000ca2b0d20caa7b0d3288ed554b926b1828399bfbb6f2d94a393521b7460fd066de635bbb0cf90a724b8c20db0c37dd5013412488f4fd610.csv", import.meta.url), mimeType: "text/csv", toString}],
    ["validity_gson@1.csv", {url: new URL("./files/e2a5846ced111e510faaa784fa7e977ca7aac276ae8228410faba8372345f7dc4a34fad3fd2bb150848bfe814b749bb4d8ee92e663e70ec3f1d8ff6ff5533282.csv", import.meta.url), mimeType: "text/csv", toString}],
    ["validity_maven@1.csv", {url: new URL("./files/d9b3f12c0d36b83aa99390963d06945ecdfae99567eff78bc88cabd4d162236eae025f77436a16f61ca7516ba499492b5f4fe939bc7b64c0b36aa3ebd130f010.csv", import.meta.url), mimeType: "text/csv", toString}],
    ["validity_jenkins@1.csv", {url: new URL("./files/ef88609e2e16a4e3e1c7a41c892bf77c35645b6a7061e9847279d23d854754b0c3c7fe551686ebfe403d0001249183ae1afc2f7480ac45adbbce7aeedd299508.csv", import.meta.url), mimeType: "text/csv", toString}],
    ["validity_hadoop@1.csv", {url: new URL("./files/f50d306f1d2042728aa2b63005fa4d748e35b74c28aeb3a9c07c5641d67cd6f5894b397bc068934d21758b1633454ff206737a35c2a90e02ce7858359ddaad5e.csv", import.meta.url), mimeType: "text/csv", toString}],
    ["validity_slf4j@1.csv", {url: new URL("./files/3084abdebfaf849b4675dfac80ec2fc5e1ba3e76e33cd93679d6c28bd967da20aaf7f80013650e4b8ccd3bf2ab1cb1d1d06f5cceb9a776dd94dc1190b1346c88.csv", import.meta.url), mimeType: "text/csv", toString}],
    ["validity_flink@1.csv", {url: new URL("./files/7292afad0f506c7a21fcf580ca88bff87968b078ddde30082b6b621cbaa518617f375f2e329e9a7804bd3ab19f6666e82a16d5555131de30f38265230dfe6f87.csv", import.meta.url), mimeType: "text/csv", toString}],
    ["validity_quarkus@2.csv", {url: new URL("./files/ace1de4d327bb12e21c2138d2a04279ed8bd237732c24a10162ff0ead5634896e724c0dd9d3bf09f976b0069c485f9fc3e1bda3662d1a9de379a05ec94017c9b.csv", import.meta.url), mimeType: "text/csv", toString}],
    ["validity_netty@2.csv", {url: new URL("./files/a29fce557d2fbec06d6d24ae01e6c99c2a5b0b85a824ad4558d331bb29fea719e49530286716d98be99af340b9e954d5da5e5235fd77bc454359d83ab805a3ce.csv", import.meta.url), mimeType: "text/csv", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer("files")).define("files", ["FileAttachment"], _files);
  main.variable(observer("process_file")).define("process_file", ["process_entry"], _process_file);
  main.variable(observer("process_entry")).define("process_entry", _process_entry);
  main.variable(observer()).define(["d3","data"], _5);
  main.variable(observer()).define(["data"], _6);
  main.variable(observer()).define(["data"], _7);
  main.variable(observer("mean_gt_heap")).define("mean_gt_heap", ["data"], _mean_gt_heap);
  main.variable(observer()).define(["mean_gt_heap"], _9);
  main.variable(observer()).define(["d3","mean_gt_heap"], _10);
  main.variable(observer("hast_heap")).define("hast_heap", ["data"], _hast_heap);
  main.variable(observer()).define(["hast_heap"], _12);
  main.variable(observer()).define(["d3","hast_heap"], _13);
  main.variable(observer()).define(_14);
  main.variable(observer("hast_pp_heap")).define("hast_pp_heap", ["d3","data"], _hast_pp_heap);
  main.variable(observer("hast_pp_0_10_heap")).define("hast_pp_0_10_heap", ["d3","data"], _hast_pp_0_10_heap);
  main.variable(observer("hast_pp_0_100_heap")).define("hast_pp_0_100_heap", ["d3","data"], _hast_pp_0_100_heap);
  main.variable(observer()).define(["d3","data"], _18);
  main.variable(observer("min_max_ratio")).define("min_max_ratio", ["d3","data"], _min_max_ratio);
  main.variable(observer()).define(["d3","min_max_ratio"], _20);
  main.variable(observer()).define(["d3","min_max_ratio"], _21);
  main.variable(observer("rel_diff")).define("rel_diff", _rel_diff);
  main.variable(observer()).define(["d3","data"], _23);
  main.variable(observer("ratioed_heaps")).define("ratioed_heaps", ["d3","data"], _ratioed_heaps);
  main.variable(observer()).define(["d3","data"], _25);
  main.variable(observer("data2")).define("data2", ["ratioed_heaps"], _data2);
  main.variable(observer("data3")).define("data3", ["data2"], _data3);
  main.variable(observer("data4")).define("data4", ["d3","data2"], _data4);
  main.variable(observer("data5")).define("data5", ["data4"], _data5);
  main.variable(observer()).define(["Plot","data5"], _30);
  main.variable(observer()).define(["Plot","data3"], _31);
  main.variable(observer()).define(["Plot","data3"], _32);
  main.variable(observer()).define(["Plot","data3"], _33);
  main.variable(observer()).define(["Plot","data3"], _34);
  main.variable(observer()).define(["Plot","data3"], _35);
  main.variable(observer("hast_pp_10_heap")).define("hast_pp_10_heap", ["d3","data"], _hast_pp_10_heap);
  main.variable(observer()).define(["hast_heap"], _37);
  main.variable(observer("data")).define("data", ["files","process_file"], _data);
  main.variable(observer()).define(["d3","data"], _39);
  main.variable(observer()).define(["d3","data"], _40);
  main.variable(observer()).define(["d3","data"], _41);
  main.variable(observer()).define(["d3","data"], _42);
  main.variable(observer()).define(["data"], _43);
  main.variable(observer()).define(["data"], _44);
  main.variable(observer()).define(["d3","data"], _45);
  main.variable(observer()).define(["d3","data"], _46);
  main.variable(observer("invalid_mappings")).define("invalid_mappings", ["data"], _invalid_mappings);
  main.variable(observer()).define(["invalid_mappings"], _48);
  main.variable(observer("invalid_changes")).define("invalid_changes", ["data"], _invalid_changes);
  main.variable(observer()).define(["d3","data"], _50);
  main.variable(observer()).define(["data"], _51);
  main.variable(observer()).define(["data"], _52);
  main.variable(observer()).define(["data"], _53);
  main.variable(observer()).define(["data"], _54);
  main.variable(observer()).define(["d3","data"], _55);
  main.variable(observer()).define(["d3","data"], _56);
  main.variable(observer()).define(["d3","data"], _57);
  main.variable(observer()).define(["data"], _58);
  main.variable(observer()).define(["data"], _59);
  main.variable(observer("invalid_results")).define("invalid_results", ["data"], _invalid_results);
  main.variable(observer()).define(["invalid_results","invalid_mappings"], _61);
  main.variable(observer()).define(["data"], _62);
  main.variable(observer("validity_ratio")).define("validity_ratio", ["invalid_results","data"], _validity_ratio);
  main.variable(observer("mappings_validity_ratio")).define("mappings_validity_ratio", ["invalid_mappings","data"], _mappings_validity_ratio);
  main.variable(observer()).define(["d3","data"], _65);
  main.variable(observer()).define(["d3","data"], _66);
  main.variable(observer()).define(["d3","data"], _67);
  main.variable(observer()).define(["Plot","data"], _68);
  return main;
}
