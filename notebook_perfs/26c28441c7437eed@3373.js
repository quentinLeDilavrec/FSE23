import define1 from "./67d1b2c32f1883c4@661.js";
import define2 from "./7536f1d9930dde80@304.js";

function _1(md){return(
md`# Benchmark HyperGumtree on computing edit scripts`
)}

function _files(FileAttachment){return(
{
  // "17": FileAttachment("perfs_17.csv"),
  // "arthas_slf4j": FileAttachment("perfs_arthas_slf4j.csv"),
  // "gson_maven_jenkins": FileAttachment("perfs_gson_maven_jenkins.csv"),
  // "skywalking_guava": FileAttachment("perfs_skywalking_guava.csv"),
  // "spark_netty_fastjson": FileAttachment("perfs_spark_netty_fastjson.csv"),
  // "spoon_logging-log4j2": FileAttachment("perfs_spoon_logging-log4j2.csv"),
  // "7": FileAttachment("perfs_gson_maven_jenkins_skywalking_guava_arthas_slf4j.csv"),
  
  "hadoop": FileAttachment("perfs_hadoop@1.csv"),
  "flink": FileAttachment("perfs_flink@1.csv"),
  "netty": FileAttachment("perfs_netty@2.csv"),
  "javaparser": FileAttachment("perfs_javaparser@1.csv"),
  "spark": FileAttachment("perfs_spark@1.csv"),
  "spoon": FileAttachment("perfs_spoon@1.csv"),
  "quarkus": FileAttachment("perfs_quarkus@2.csv"),
  "logging-log4j": FileAttachment("perfs_logging-log4j2@1.csv"),
  "maven": FileAttachment("perfs_maven@1.csv"),
  "jenkins": FileAttachment("perfs_jenkins@1.csv"),
  "gson": FileAttachment("perfs_gson@1.csv"),
  "arthas": FileAttachment("perfs_arthas@1.csv"),
  "dubbo": FileAttachment("perfs_dubbo@1.csv"),
  "fastjson": FileAttachment("perfs_fastjson@1.csv"),
  "guava": FileAttachment("perfs_guava@1.csv"),
  "skywalking": FileAttachment("perfs_skywalking@1.csv"),
  "slf4j": FileAttachment("perfs_slf4j@1.csv"),
  "jackson-core": FileAttachment("perfs_jackson-core@1.csv"),
  "aws-toolkit-eclipse": FileAttachment("perfs_aws-toolkit-eclipse@1.csv"),
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
    // gt_t:fun_t(entry,"gt"),
    // hast_t:fun_t(entry,"hast")
  }
}
)}

async function _data(files,process_file){return(
(await Promise.all([...
    Object
    .entries(files)
    .map(process_file)
])).flat()
)}

function _actions_per_input(d3,data){return(
d3.rollup(data, d => d3.mean(d.map(d=>d.actions).filter(x=>x!==-1)),d=>d.project, d=>d.input)
)}

function _7(data,compute_t,actions_per_input,entries_per_input){return(
data.map(x=>({t:compute_t(["subtree", "bottomup", "gen"])(x), k:x.kind, a:x.actions, p:x.project,api:actions_per_input.get(x.project).get(x.input), x, o: entries_per_input.get(x.input)})).filter(x=>x.t>100.&&x.api<2000)
)}

function _8(d3,data){return(
d3.rollups(data, d => d,d=>d.input).filter(x=>x[0].startsWith("60780c64"))
)}

function _9(d3,data){return(
d3.rollups(data, d => d,d=>d.input).filter(x=>x[0].startsWith("eed14"))
)}

function _10(d3,data){return(
d3.rollups(data, d => d,d=>d.input).filter(x=>x[0].startsWith("959d"))
)}

function _11(data){return(
data.filter(x=>x.project==="netty" && x.actions===-1)
)}

function _bl_actions_per_input(d3,data,baseline_kind){return(
d3.rollup(data, d => d.find(x=>x.kind===baseline_kind)?.actions, d=>d.input)
)}

function _entries_per_input(d3,data){return(
d3.rollup(data, d => d, d=>d.input)
)}

function _14(d3,data){return(
[...d3.rollup(data, d => d[0], d=>d.input, d=>d.kind).values()].map(k=>k.get("java_gumtree"))
)}

function _15(d3,data,t){return(
[...d3.rollup(data, d => d[0], d=>d.input, d=>d.kind).values()]
          .map(k=>[k.get("gumtree_lazy"),k.get("java_gumtree")])
          .filter(d=>d[0]!==undefined && d[1]!==undefined)
          .filter(d=>d[0].topdown_t>=0 && d[1].topdown_t>=0 && d[1].actions!==-1)
          .map(d=>[d[0].project,d,t(d[0]),t(d[1])])
)}

function _16(d3,data,t){return(
d3.quantile([...d3.rollup(data, d => d[0], d=>d.input, d=>d.kind).values()]
          .map(k=>[k.get("gumtree_lazy"),k.get("java_gumtree")])
          .filter(d=>d[0]!==undefined && d[1]!==undefined)
          .filter(d=>d[0].topdown_t>=0 && d[1].topdown_t>=0 && d[1].actions!==-1)
          .map(d=>t(d[1])/t(d[0])),0.975)
)}

function _17(d3,data,t){return(
d3.quantile([...d3.rollup(data, d => d[0], d=>d.input, d=>d.kind).values()]
          .map(k=>[k.get("gumtree_lazy"),k.get("java_gumtree")])
          .filter(d=>d[0]!==undefined && d[1]!==undefined)
          .filter(d=>d[0].topdown_t>=0 && d[1].topdown_t>=0 && d[1].actions!==-1)
          .map(d=>t(d[1])/t(d[0])),0.025)
)}

function _18(d3,data){return(
d3.quantile([...d3.rollup(data, d => d[0], d=>d.input, d=>d.kind).values()]
          .map(k=>k.get("gumtree_lazy"))
          .filter(d=>d!==undefined)
          .filter(d=>d.topdown_t>=0)
          .map(d=>d.prepare_topdown_t+d.topdown_t),0.5)
)}

function _19(d3,data){return(
d3.quantile([...d3.rollup(data, d => d[0], d=>d.input, d=>d.kind).values()]
          .map(k=>k.get("gumtree_lazy"))
          .filter(d=>d!==undefined)
          .filter(d=>d.bottomup_t>=0)
          .map(d=>d.prepare_bottomup_t+d.bottomup_t),0.5)
)}

function _20(d3,data){return(
d3.quantile([...d3.rollup(data, d => d[0], d=>d.input, d=>d.kind).values()]
          .map(k=>k.get("java_gumtree"))
          .filter(d=>d!==undefined)
          .filter(d=>d.topdown_t>=0)
          .map(d=>d.prepare_topdown_t+d.topdown_t),0.5)
)}

function _21(d3,data){return(
d3.quantile([...d3.rollup(data, d => d[0], d=>d.input, d=>d.kind).values()]
          .map(k=>k.get("java_gumtree"))
          .filter(d=>d!==undefined)
          .filter(d=>d.bottomup_t>=0)
          .map(d=>d.prepare_bottomup_t+d.bottomup_t),0.5)
)}

function _22(d3,data){return(
d3.median([...d3.rollup(data, d => d[0], d=>d.input, d=>d.kind).values()].map(k=>k.get("gumtree_not_lazy")).map(d=>d.prepare_topdown_t+d.topdown_t))
)}

function _23(d3,data){return(
d3.mean([...d3.rollup(data, d => d[0], d=>d.input, d=>d.kind).values()].map(k=>k.get("gumtree_lazy")).map(d=>d.prepare_gen_t/(d.prepare_gen_t+d.gen_t)))
)}

function _24(d3,data){return(
d3.mean([...d3.rollup(data, d => d[0], d=>d.input, d=>d.kind).values()].map(k=>k.get("gumtree_not_lazy")).map(d=>d.prepare_gen_t/(d.prepare_gen_t+d.gen_t)))
)}

function _25(d3,data){return(
d3.mean([...d3.rollup(data, d => d[0], d=>d.input, d=>d.kind).values()].map(k=>k.get("gumtree_lazy")).map(d=>d.prepare_gen_t+d.gen_t))
)}

function _26(d3,data){return(
d3.mean([...d3.rollup(data, d => d[0], d=>d.input, d=>d.kind).values()].map(k=>k.get("gumtree_not_lazy")).map(d=>d.prepare_gen_t+d.gen_t))
)}

function _27(bl_actions_per_input){return(
bl_actions_per_input.get("959d82c28041b26b0a95c7fcd8a8865ae8b52eca/89c0d1876c1c6ef6916386fabdea3795918686fc")
)}

function _28(d3,data,bl_actions_per_input){return(
d3.rollups(data, d => d, d=>d.project, d=>d.input).filter(x=>x[0]==="netty")
    .map(x=>x[1].filter(x=>bl_actions_per_input.get(x[0])>0).map(x=>x[1].filter(x=>x.actions===-1)).filter(x=>x.length!==0))
)}

function _entries_per_input_and_kind(d3,data){return(
d3.rollup(data, d => d[0],d=>d.input, d=>d.kind)
)}

function _30(d3,data){return(
d3.rollup(data, d => d[0],d=>d.project,d=>d.input, d=>d.kind).get("javaparser")
)}

function _31(data){return(
data.filter(d=>d.actions===-1)
)}

function _timeout_per_input(d3,data){return(
d3.rollup(data, d => d.every(d=>d.actions===-1) ,d=>d.project, d=>d.input,d=>d.kind)
)}

function _search(Inputs,data){return(
Inputs.search(data)
)}

function _34(Inputs,search,d3){return(
Inputs.table(search, {
  format: {
    input: d=> d.slice(60),
    Year: d3.format("d") // format as "1960" rather than "1,960"
  }
})
)}

function _data2(data){return(
data.map(x=>([
  {...x, gt_t: undefined, hast_t: undefined, t: x.hast_t, kind: "hast"},
  {...x, gt_t: undefined, hast_t: undefined, t: x.gt_t, kind: "gt"}
])).flat()
)}

function _data_diff(d3,data,baseline_kind,rel_diff,t){return(
d3.rollups(data,l=>{
  // {...x, t: x.hast_t-x.gt_t}
  // let g = d3.group(l,d=>d.kind)//g.get(baseline_kind)?.[0]
  return {bl:l.find(d=>d.kind===baseline_kind), rest: l.filter(d=>d.kind!==baseline_kind)}
},d=>d.input).map(([k,v])=>v).filter(x=>x !== undefined).filter(x=>x.bl !== undefined).filter(x=>x.bl.topdown_t !== undefined)
.map(d=>{
  let lazy = d.rest.find(d=>d.kind!=="gumtree_lazy");
  return({t:rel_diff(t(d.bl),t(lazy)),...d.bl,lazy})
})
)}

function _37(data,diff){return(
data.sort((a,b)=> {
  let bb = diff(b.gt_t,b.hast_t);
  let aa = diff(a.gt_t,a.hast_t);
  //rel_diff(b.gt_t,b.hast_t)-rel_diff(a.gt_t,a.hast_t)
  return (bb-aa)/(bb+aa)
}).slice(0,4)
)}

function _38(data){return(
data.filter(x=>x.gt_t<x.hast_t).sort((a,b)=> b.gt_c - a.gt_c ).slice(0,4)
)}

function _bad(data){return(
data.filter(x=>x.gt_c!==x.hast_c)
)}

function _40(Inputs,bad){return(
Inputs.table(bad, {
  format: {
    input: d=> d.slice(60),
  }
})
)}

function _41(bad,data){return(
bad.length / data.length * 100
)}

function _42(Plot,data,d3)
{ let a = Plot.plot({
  marks: [
    Plot.rectY(data, Plot.binX(
                {y: "count"},
                {x: d=> (d.src_s+d.dst_s)/2,
                 //filter: d=> d.kind==="hast",
                 sort: {x: "y", reverse: true}
                })),
    Plot.ruleY([0])
  ],
  facet: {
    data: data,
    y: d => d,//.project,
    marginLeft: 5
  },
  x: {
    label: "#nodes →",
  },
  fy:{
    transform: d => d.project,
    // tickFormat: (d) => d==undefined ? d : d.toFixed(0),
    label: "project",
  },
});
 let _d3 = d3;
 // let s = d3.select(a).selectAll("[aria-label='x-axis'] .tick line").attr("x1", -30)
 // debugger;
return a}


function _44(Plot,data,compute_t,checkboxes,t,label_ref){return(
Plot.plot({
  marks: [
    Plot.frame({stroke: "#aaa", strokeWidth: 0.5}),
    Plot.text(data, {
      text:d=>"x",
      x: "actions", 
      // x: "mappings", 
      y: compute_t(checkboxes),
      filter: d => d.actions > 0,
      fill: "kind",
      r: d=>Math.sqrt(d.src_s*d.dst_s)/2, 
      title: (d) =>
        `${d.kind}: ${t(d)} \ninput_s: ${d.src_s}<->${d.dst_s} \n${d.input}`,
    }),
  ],
  facet: {
    data: data,
    y: d => d,//.project,
    marginLeft: 535
  },
  fy:{
    transform: d => d.project,
    // tickFormat: (d) => d==undefined ? d : d.toFixed(0),
    label: "projects",
  },
  x: {
    label: label_ref,
    grid: true,
    type: "log", // set the type
  },
  y: {
    label: "time (s) →",
    type: "log",
    grid: true,
  },
  color: {
    legend: true
  },
})
)}

function _45(fix_bp,Plot,unbined,d3,x1_max,label_ref,refs,oqr,t,format_time,bp_text,bp_text2){return(
fix_bp(Plot.plot({
  width: 1400,
  height: 730,
  color: {
    legend: true,
    domain: ["gumtree_lazy","gumtree_partial_lazy","gumtree_not_lazy","java_gumtree"],
  },
  x: {
    axis: null,
    inset: 0, label: "kind",
     // type: "log"
    domain: ["gumtree_lazy","gumtree_partial_lazy","gumtree_not_lazy","java_gumtree"],
     },
  y: {grid: true, inset: 0, label: "time (s) →",
     type: "log",
      // domain: [0, 200]
     },
  facet: {
    data: unbined,
    x: d => d,//.gt_c,
    y: d => d,//.project,
    marginLeft: 5,
  },
  fx:{
    align:50,
    labelAnchor:"right",
    transform: d => d.x0,
    tickFormat: (d,i) => d3.format(".3s")(d) + ".." + (x1_max[i] ? d3.format(".3s")(x1_max[i]) : ""),
    label: label_ref,
  },
  fy:{
    tickRotate: -90,
    transform: d=> {
      let a = refs["actions"](d)
      return a >= 1000 ? "1000.." :
      a >= 10 ? "10..1000" :
      a >= 1 ? "1..10" :
      "0..1"
    },
    // tickFormat: (d) => d==undefined ? d : d.toFixed(0),
    // label: "projects",
    label: "#changes",
    reverse: true,
  },
  marks: [
    Plot.frame({stroke: "#aaa", strokeWidth: 0.5}),
    Plot.dot(unbined, 
     Plot.map(
      {
          y: oqr,
      }, {
      y: t,
      title: d => `${d.project}: ${format_time(t(d))}`,
      // x: "kind",
      z: "kind",
      x: "kind",
      // x: d=>"java_gumtree",
      symbol: "times",
      stroke: "#333",
      r:1,
      // stroke: "kind",
      strokeOpacity: 0.6,
      strokeWidth: .5,
      filter: d => t(d) > 0,
    })),
    Plot.ruleX(unbined, Plot.groupX({
      // y1: loqr1,
      // y2: hiqr2, 
      y1: d => d3.quantile(d,.025),
      y2: d => d3.quantile(d,.975),
    },{
      y: t,
      x: "kind",
      stroke: "kind",
      sort: t,
      strokeWidth: 2,
      filter: d => t(d) > 0,
      // filter: d => {console.log(42,d); return t(d) > 0 },
    })),
    Plot.barY(unbined, Plot.groupX({
      y1: "p25",//d => d3.quantile(d,0.25),
      y2: "p75",//d => d3.quantile(d,0.75),
    },{
      y: t,
      x: "kind",
      stroke: "#333",
      stroke: "kind",
      sort: t,
      filter: d => t(d) > 0,
      fill: "#ccc",
      strokeWidth: 0,
      insetLeft: 2,
      insetRight: 2,
      // fillOpacity: 0.2,
    })),
    Plot.tickY(unbined, Plot.groupX({
      y: "mean", 
      title: d => `mean ${d[0].kind}: ${format_time(d3.mean(d,d=>t(d)))}`,
    },{
      y: t,
      x: "kind",
      // stroke: "kind",
      strokeWidth: 3,
      inset: -1,
      filter: d => t(d) > 0,
    })),
    Plot.tickY(unbined, Plot.groupX({
      y: "p50", 
      title: d => `median ${d[0].kind}: ${format_time(d3.median(d,d=>t(d)))}`,
    },{
      y: t,
      x: "kind",
      stroke: "kind",
      strokeWidth: 2,
      filter: d => t(d) > 0,
    })),
    Plot.text(unbined, Plot.groupX({
      text: bp_text, 
      x: "first",
      // textAnchor: d=>"end",
    },{
      text: d=>d,
      textAnchor: "end",
      y: 0.0003,
      x: "kind",
      dx: -5,
      stroke: "white",
      strokeWidth: .9,
      fill: "black",
      sort: t,
      fontSize: 6,
      rotate:90,
      filter: d => t(d) > 0,
      // filter: d => {console.log(42,d); return t(d) > 0 },
    })),
    Plot.text(unbined, Plot.groupX({
      // text: d=>"" + format_time(d3.median(d,d=>t(d))) + "",
      text: bp_text2,
      // x: "first",
      // textAnchor: d=>"end",
    },{
      text: d=>d,
      textAnchor: "start",
      y: 1000,
      dy: -15,
      x: "kind",
      dx: -8,
      stroke: "white",
      strokeWidth: .9,
      fill: "black",
      sort: t,
      fontSize: 6,
      rotate:30,
      filter: d => t(d) > 0,
      // filter: d => {console.log(42,d); return t(d) > 0 },
    })),
  ]
}))
)}

function _checkboxes(Inputs){return(
Inputs.checkbox(["subtree", "bottomup", "gen"], {label: "Select some", value: ["subtree", "bottomup"]})
)}

function _prep_options(Inputs){return(
Inputs.checkbox(["prep_subtree", "prep_bottomup", "prep_gen"], {label: "Select preparations to display individially (WIP)", value: ["prep_subtree", "prep_bottomup", "prep_gen"]})
)}

function _reference_select(Inputs){return(
Inputs.radio(["actions", "mappings", "tree"], {label: "X axis", value: "tree"})
)}

function _49(html,my_main,match_inter,refs,other_plot_opts){return(
html`<svg fill="currentColor" font-family="system-ui, sans-serif" font-size="10" text-anchor="middle" width="1088" height="585" viewBox="0 0 1088 585" style="overflow: visible;">
${my_main({filter:d=> match_inter(refs.actions(d),1000), transform: d => "1000..          "}, {
  y: 1300,
  filter:d=> d.kind == "gumtree_lazy", rotate: 0,}, {
  y: d => d[0]?.x0 > 1400000 ? 0.2 : 150,
  filter:d=> d.kind == "gumtree_lazy", rotate: 0,}, {
  fx: {axis: null,}, color: {legend: false},
  height: 150 -10, marginBottom: -2, marginRight: 35},
  s => s.setAttribute("y", "0"))
}
${
my_main({filter:d=> match_inter(refs.actions(d),10,1000), transform: d=> "10..1000"}, {
  // y: d => d[0]?.x0 > 1100000 ? 0.02 : 1000,
  y: 170,
  filter:d=> d.kind == "gumtree_lazy", rotate: 0,}, {
  y: d => d[0]?.x0 > 305000 ? 0.03 : 30,
  filter:d=> d.kind == "gumtree_lazy", rotate: 0,}, {
  ...other_plot_opts,fx: {axis: null,},fy: {label: "",}, 
  height: 150 -35, marginTop: -9, marginBottom: -5, marginRight: 35,
},
  s => s.setAttribute("y", "" + (150+15)))
}
${my_main({filter:d=> match_inter(refs.actions(d),1,10), transform: d=> "1..1000"}, {
  // y: d => d[0]?.x0 > 1100000 ? 0.05 : 1000,
  y: 50,
  filter:d=> d.kind == "gumtree_lazy", rotate: 0,}, {
  y: d => d[0]?.x0 > 305000 ? 0.03 : 10,
  filter:d=> d.kind == "gumtree_lazy", rotate: 0,}, {
  ...other_plot_opts,fx: {axis: null,},fy: {label: "",},
  marginBottom: 4, marginTop: 10, marginRight: 35,},
  s => s.setAttribute("y", "" + (2*150-15)))
  // s => s.setAttribute("y", "" + (150+15)))
}
${my_main({filter:d=> match_inter(refs.actions(d),0,1), transform: d=> "..1"}, {
  // y: d => d[0]?.x0 > 1100000 ?0.05 : 1000, 
  y: 40,
  filter:d=> d.kind == "gumtree_lazy", rotate: 0,}, {
  y: d => d[0]?.x0 > 305000 ? 0.01 : 2,
  filter:d=> d.kind == "gumtree_lazy", rotate: 0,}, {
  ...other_plot_opts,fy: {label: "",}, 
  marginTop:10, marginBottom: 18, marginRight: 35,},
  // s => s.setAttribute("y", "" + (2*150-15)))
  s => s.setAttribute("y", "" + (3*150-16)))
}
</svg>`
)}

function _match_inter(){return(
(x,lo,hi) => lo <= x && (hi===undefined || x < hi)
)}

function _other_plot_opts(){return(
{
    color: {legend: false},
    y: {label: "",},
}
)}

function _my_main(fix_bp,Plot,unbined,d3,x1_max,label_ref,my_bp,filter_wrong){return(
function my_main({filter, transform}, text_gain, text_gain2, plot = {}, svg_op=(x=>x)) {  
  let r = fix_bp(Plot.plot({
  width: 1100,
  height: 150,
  ...plot,
  color: {
    legend: true,
    domain: ["gumtree_lazy","gumtree_partial_lazy","gumtree_not_lazy","java_gumtree"],
    tickFormat: d => (console.log(d), {gumtree_lazy:"lazy",gumtree_partial_lazy:"partial lazy",gumtree_not_lazy:"not lazy",java_gumtree:"original gumtree"}[d]),
    ...plot.color,
  },
  x: {
    axis: null,
    inset: 0, label: "kind",
     // type: "log"
    domain: ["gumtree_lazy","gumtree_partial_lazy","gumtree_not_lazy","java_gumtree"],
    ...plot.x,
     },
  y: {grid: true, inset: 0, label: "time (s) →",
     type: "log",
      // domain: [0, 200]
    ...plot.y,
     },
  facet: {
    data: unbined,
    x: d => d,
    y: d => d,
    marginLeft: 5,
    ...plot.facet,
  },
  fx:{
    align:50,
    labelAnchor:"right",
    transform: d => d.x0,
    tickFormat: (d,i) => d3.format(".3s")(d) + ".." + (x1_max[i] ? d3.format(".3s")(x1_max[i]) : ""),
    label: label_ref + "       ",
    ...plot.fx,
  },
  fy:{
    tickRotate: -90,
    labelAnchor:"center",
    labelOffset:26,
    transform,
    filter,
    // tickFormat: (d) => d==undefined ? d : d.toFixed(0),
    // label: "projects",
    label: "                             #changes →",
    // reverse: true,
    ...plot.fy,
  },
  marks: [
    Plot.frame({stroke: "#aaa", strokeWidth: 0.5}),
    my_bp({filter: d => filter_wrong(d) && filter(d),}, text_gain, text_gain2),
  ]
}))
  svg_op(r)
  return r
}
)}

function _filter_wrong(t,checkboxes){return(
d => t(d) > -1 && ((checkboxes.find(x=>x==="gen")===undefined) || (/*bl_actions_per_input.get(d.input)>-1 &&*/ d.actions>-1))
)}

function _my_bp(Plot,unbined,oqr,t,format_time,d3,bp_text2){return(
function my_bp({filter},text_gain = {}, text_gain2 = {}) {
  return [
    Plot.dot(unbined, 
     Plot.map(
      {
          y: oqr,
      }, {
      y: t,
      title: d => `${d.project}: ${format_time(t(d))}\n ${d.actions}`,
      // x: "kind",
      z: "kind",
      x: "kind",
      // x: d=>"java_gumtree",
      symbol: "times",
      stroke: "#333",
      r:1.5,
      // stroke: "kind",
      strokeOpacity: 0.6,
      strokeWidth: .5,
      filter,
    })),
    Plot.ruleX(unbined, Plot.groupX({
      // y1: loqr1,
      // y2: hiqr2, 
      y1: d => d3.quantile(d,.025),
      y2: d => d3.quantile(d,.975),
    },{
      y: t,
      x: "kind",
      stroke: "kind",
      sort: t,
      strokeWidth: 2,
      filter,
    })),
    Plot.barY(unbined, Plot.groupX({
      y1: "p25",//d => d3.quantile(d,0.25),
      y2: "p75",//d => d3.quantile(d,0.75),
    },{
      y: t,
      x: "kind",
      stroke: "#333",
      stroke: "kind",
      sort: t,
      filter,
      fill: "#ccc",
      strokeWidth: 0,
      insetLeft: 2,
      insetRight: 2,
      // fillOpacity: 0.2,
    })),
    Plot.tickY(unbined, Plot.groupX({
      y: "mean", 
      title: d => `mean ${d[0].kind} ${d[0].input} ${d.length}: ${format_time(d3.mean(d,d=>t(d)))}`,
    },{
      y: t,
      x: "kind",
      // stroke: "kind",
      strokeWidth: 3,
      inset: -1,
      filter,
    })),
    Plot.tickY(unbined, Plot.groupX({
      y: "p50", 
      title: d => `median ${d[0].kind}: ${format_time(d3.median(d,d=>t(d)))}`,
    },{
      y: t,
      x: "kind",
      stroke: "kind",
      strokeWidth: 2,
      filter,
    })),
    // Plot.text(unbined, Plot.groupX({
    //   text: bp_text, 
    //   x: "first",
    //   // textAnchor: d=>"end",
    // },{
    //   text: d=>d,
    //   textAnchor: "end",
    //   y: 0.0003,
    //   x: "kind",
    //   dx: -5,
    //   stroke: "white",
    //   strokeWidth: .9,
    //   fill: "black",
    //   sort: t,
    //   fontSize: 6,
    //   rotate:90,
    //   filter,
    // })),
    Plot.text(unbined, Plot.groupX({
      // text: d=>"" + format_time(d3.median(d,d=>t(d))) + "",
      text: d=>bp_text2(d),
      // x: "first",
      // textAnchor: d=>"end",
    },{
      text: d=>d,
      textAnchor: "start",
      y: 1000,
      dy: -15,
      x: "kind",
      dx: -10,
      stroke: "white",
      strokeWidth: 1.9,
      fill: "black",
      sort: t,
      fontSize: 11,
      rotate:30,
      ...text_gain,
      filter: d => filter(d) && /*filter_wrong(d) &&*/  text_gain.filter(d) /*&& ((checkboxes.find(x=>x==="gen")===undefined) || bl_actions_per_input.get(d.input)>-1)*/,
    })),
    Plot.text(unbined, Plot.groupX({
      // text: d=>"" + format_time(d3.median(d,d=>t(d))) + "",
      text: d=>bp_text2(d,"gumtree_not_lazy"),
      // x: "first",
      // textAnchor: d=>"end",
    },{
      text: d=>d,
      textAnchor: "start",
      y: 1,
      dy: -15,
      x: "kind",
      dx: -10,
      stroke: "white",
      strokeWidth: 1.9,
      fill: "red",
      sort: t,
      fontSize: 9,
      // rotate:30,
      ...text_gain2,
      filter: d => d.kind == "gumtree_lazy",
      // filter: d => filter(d) && /*filter_wrong(d) &&*/  text_gain.filter(d) /*&& ((checkboxes.find(x=>x==="gen")===undefined) || bl_actions_per_input.get(d.input)>-1)*/,
    })),

  ]
}
)}

function _bp_text(d3){return(
function bp_text(l) {
  // if (l[0].x0===raw_bined[0].x0 && l[0].kind !== baseline_kind)
  //   return " same             "
  let v = d3.rollups(l,d=>d.length,d=>d.project);
  v.sort((a,b)=>a[0]<b[0]?-1:1)
  return v.map(([k,v])=>k+"="+v).join(" ")
}
)}

function _bp_text2(baseline_kind,bp_text2_aux,entries_per_input_and_kind,t,format_time,d3){return(
function bp_text2(l, k = baseline_kind) {
  if (false)
    return bp_text2_aux(l) + "\n" + bp_text2_aux(l, "gumtree_not_lazy")

  let g = d=> entries_per_input_and_kind.get(d.input).get(k)
  let f = d => {
    let bl = g(d)
    return bl===undefined ? Number.NaN : [t(d),t(bl)]
  }
  let aaa = l.map(f)
  return bp_text2_aux(l, k) + "\n~" + format_time(d3.mean(aaa,d=>d[0])) + " < ~" + format_time(d3.mean(aaa,d=>d[1]))
}
)}

function _bp_text2_aux(baseline_kind,entries_per_input_and_kind,rel_diff,t,d3,stdlib){return(
function bp_text2_aux(l, k = baseline_kind) {
  let g = d=> entries_per_input_and_kind.get(d.input).get(k)
  let f = d => {
    let bl = g(d)
    return bl===undefined ? Number.NaN : rel_diff(t(bl),t(d))
  }
  let m = d3.mean(l,f)
  let ooo = l.map(g).filter(x=>x!==undefined).map(t)
  if (ooo.length === 0)
    console.log(42,ooo.length)
  let pval = ooo.length === 0 ? undefined : stdlib.ttest2(l.map(t), ooo)
  // console.log(pval)
  // console.log(pval.pValue)
  return ("" + (Number.isNaN(m) || m == undefined ? "": d3.format(".1%")(m)) 
    + (pval===undefined ? "" :" p=" + d3.format(".2f")(pval.pValue)))
}
)}

function _baseline_kind(){return(
"java_gumtree"
)}

function _fix_bp(){return(
function fix_bp(p) {
  // // d3.select(p).selectAll("[aria-label='fx-axis'] .tick line").attr("x1", -30).attr("x2", -30).attr("y2", 10)
  // d3.select(p)
  //   .selectAll("[aria-label='fx-axis'] .tick line")
  //   .attr("y2",5)
  // d3.select(p)
  //   .selectAll("[aria-label='fx-axis'] .tick text")
  //   .attr("text-anchor","start")
  // let t = d3.select(p)
  //   .selectAll("[aria-label='fx-axis'] .tick").nodes()
  //   .map(x=>parseInt(x.getAttribute("transform").slice(10,-3)))
  // let q = t.slice(1).map((x,i)=>x-t[i])
  // q = d3.mean(q)
  // d3.select(p)
  //   .selectAll("[aria-label='fx-axis'] .tick")
  //   .attr("transform",(x,i)=>"translate("+(t[i]-q/2.)+",0)")
          //x.attr("transform",x.attr("transform")+` translate(&{q},0)`))
  // console.dir(q)
  return p
}
)}

function _60(Plot,unbined,compute_t,checkboxes){return(
Plot.plot({
  height: 400,
  width: 900,
  marginTop: 0,
  marginLeft: 50,
  x: {axis: null, inset: 1, label: "weight (kg) →",
    domain: ["gumtree_lazy","gumtree_partial_lazy","gumtree_not_lazy","java_gumtree"],
     },
  y: {grid: true, inset: 1, 
      type: "log",
     },
  color: {
    legend: true,
    domain: ["gumtree_lazy","gumtree_partial_lazy","gumtree_not_lazy","java_gumtree"],
  },
  facet: {
    data: unbined,
    x: d => d,//.gt_c,
    // y: d => d,//.project,
    marginLeft: 5
  },
  fx: {
    // transform: (d) => d==0? 0 : Math.floor(d / 100) * 100,
    transform: d => d.x0,
    // tickFormat: (d) => d ? d.toFixed(1) : "N/A",
    label: "changes →",
    // reverse: true
  },
  facet: {
    data: unbined,
    x: d => d,
    // y: d => d,//.project,
    marginLeft: 50
  },
  fy:{
    transform: d => d.project,
    // tickFormat: (d) => d==undefined ? d : d.toFixed(0),
    label: "projects",
  },
  marks: [
    Plot.frame({stroke: "#aaa", strokeWidth: 0.5}),
    // Plot.frame({stroke: "#aaa", strokeWidth: 0.5}),
    Plot.boxY(unbined, {y: compute_t(checkboxes), x: "kind", stroke: "kind", strokeWidth: .5, r: 2})
  ]
})
)}

function _61(Plot,data,format_time,d3,t){return(
Plot.plot({
  height: 640,
  marginLeft: 50,
  color: {
    // scheme: "bupu",
    // type: "symlog"
  },
  x: {inset: 1,
    label: "#nodes →",
      // axis:null,
      type: "log",
    // domain: ["gumtree_lazy","gumtree_partial_lazy","gumtree_not_lazy","java_gumtree"],
      domain: [500000, 9000000]
     },
  y: {grid: true, inset: 1, 
      type: "log",
     },
  color: {
    legend: true,
  },
  facet: {
    data: data,
    x: d => d,//.gt_c,
    // y: d => d,//.project,
    marginLeft: 5
  },
  fx: {
    // transform: (d) => d==0? 0 : Math.floor(d / 100) * 100,
    transform: d => d.kind,
    // tickFormat: (d) => d ? d.toFixed(1) : "N/A",
    label: "",
    // reverse: true
  },
  marks: [
    Plot.rect(data, Plot.bin({
      fill: "mean",
      // y1: loqr1,
      // y2: hiqr2, 
      title: d => ""+d[0].project+" " + format_time(d3.mean(d.map(t)))
    },{
      x: d=>d.mappings,
      y: d=>d.actions,
      // filter: d=>d.kind===baseline_kind,
      filter: d=>d.actions>0,
      fill: t,
      clip: true,
      // thresholds: 10,
    })),
  ]
})
)}

function _chunk(){return(
function chunk (arr, size) {
  return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size)
  );
}
)}

function _text_heatmap(d3,chunk){return(
function text_heatmap(d) {
  let p = d3.groups(d, d=>d.project).map(([k,v])=>k)
  let f_p = " "+ (p.length <= 2 ? p : "\n" + chunk(p,2).join("\n"))
  return ""+d3.format(".1%")(d3.median(d.map(d=>d.t)))
        + f_p
        // +" "+d3.format(".1%")(d3.median(d.map(d=>d.t))),
}
)}

function _64(Plot,d3,data_diff,format_time,t,refs){return(
Plot.plot({
  height: 640,
  marginLeft: 50,
  color: {
    scheme: "Turbo",
    type: "symlog",
    label: "relative difference →",
    legend: true,
    reverse: true,
    // type: "diverging",
    pivot: 0,
    domain: [-1,1],
    // range: ["red", "blue"],
    // interpolate: d3.interpolateRgb.gamma(2.2)
  },
  opacity: {
    type: "symlog",
  },
  clip: true,
  x: {inset: 1,
      label: "#nodes →",
      tickRotate:-10,
      type: "sqrt",
      tickFormat: d3.format(".3s"),
    // type: "symlog",
    // domain: ["gumtree_lazy","gumtree_partial_lazy","gumtree_not_lazy","java_gumtree"],
      // domain: [0, 20000000],
      domain: [0, 3500000],
     },
  y: {grid: true, inset: 1, 
      label: "#changes →",
      type: "sqrt",
      // type: "log",
      // domain: [0, 22000],
      domain: [0, 4000],
     },
  marks: [
    Plot.rect(data_diff, Plot.bin({
      fill: "mean",
      opacity: d => d.length,
      filter: d => d.length>4,
      // y1: loqr1,
      // y2: hiqr2, 
      title: d => "" + d[0].project + " (" + d.length + ") " + 
        d3.format(".3%")(d3.mean(d.map(d=>d.t))) + ": " + 
        format_time(d3.mean(d.map(d=>t(d)))) + " lazy: " + 
        format_time(d3.mean(d.map(d=>t(d.lazy))))
    },{
      x: {thresholds: "freedman-diaconis", value: d=>d.mappings},
      y: {
        thresholds: [0,1,2,4,6,8,10, 20, 50, 100, 150, 200, 400, 600, 800, 1000, 2000, 3000, 4000, 10000, 20000, 100000, 1000000, 2000000],
        value: refs["actions"]},
      // filter: d=>d.kind===baseline_kind,
      fill: d=>d.t,
      clip: true,
      // thresholds: "freedman-diaconis",//[0,1,2,4,6,8,10, 100, 1000, 4000, 10000, 20000, 100000, 1000000, 2000000],
    })),
    // Plot.text(data_diff, Plot.bin({
    //   text: text_heatmap,
    //   // y1: loqr1,
    //   // y2: hiqr2, 
    //   title: d => "" + d[0].project + " " + 
    //     d3.format(".3%")(d3.mean(d.map(d=>d.t))) + ": " + 
    //     format_time(d3.mean(d.map(d=>t(d)))) + " lazy: " + 
    //     format_time(d3.mean(d.map(d=>t(d.lazy))))
    // },{
    //   x: d=>d.mappings,
    //   y: refs["actions"],
    //   stroke: "white",
    //   fill: "black",
    //   // filter: d=>d.kind===baseline_kind,
    //   // thresholds: 10,
    // })),
  ]
})
)}

function _65(Plot,data,format_time,d3,t){return(
Plot.plot({
  height: 640,
  width: 1040,
  marginLeft: 50,
  color: {
    // scheme: "bupu",
    type: "symlog"
  },
  x: {inset: 1, label: "#nodes →",
      // type: "symlog",
      domain:[0,10000000],
     },
  y: {grid: true, inset: 1, 
      // type: "symlog",
      domain:[-10000,150000],
     },
  color: {
    legend: true,
  },
  facet: {
    data: data,
    x: d => d,//.gt_c,
    // y: d => d,//.project,
    marginLeft: 5
  },
  fx: {
    // transform: (d) => d==0? 0 : Math.floor(d / 100) * 100,
    transform: d => d.kind,
    // tickFormat: (d) => d ? d.toFixed(1) : "N/A",
    label: "changes →",
    // reverse: true
  },
  marks: [
    Plot.rect(data, Plot.bin({
      fill: "mean",
      // y1: loqr1,
      // y2: hiqr2, 
      title: d => ""+d[0].project+" " + format_time(d3.mean(d.map(t))) + " " + d.length + " " + d[0].actions
    },{
      x: d=>d.mappings,
      y: d=>d.actions,
      // filter: d=>d.kind==="gumtree_lazy" || d.kind ===baseline_kind,
      fill: t,
      // thresholds: 10,
    })),
  ]
})
)}

function _format_time(d3){return(
function(time_s){
  if(time_s < 1.) return "" + d3.format(".3s")(time_s * 1000) + "ms";
  if(time_s < 60.) return d3.format(".3s")(time_s) + "s";
  let d = new Date(time_s*1000);
  const t = d.getTime();
  if(t < 3600000) return d3.timeFormat('%M:%S')(d);
  if(t < 3600000*24) return d3.timeFormat('%Hh%M')(d);
  // return d3.timeFormat('%Hh%mm%S')(date);
  return "" + d
}
)}

function _67(format_time){return(
format_time(61.10)
)}

function _dd(){return(
new Date(1.01*1000)
)}

function _69(dd){return(
dd.set
)}

function _70(d3){return(
d3.timeFormat('%L')(new Date(1.01*1000))
)}

function _bin_ckmeans(d3,simple){return(
d3.bin()
  .thresholds(data => {
    console.log(1111111)
    let v = simple.ckmeans(data, 12).map(l => d3.min(l))
    return v
  })
)}

function _bin_ckmeans2(d3,simple){return(
d3.bin()
  .thresholds(data => {
    let v = simple.ckmeans(data, 10).map(l => d3.min(l))
    v[0] = 1;
    v = [0].concat(v); 
    console.log(v)
    return v})
)}

function _bin_simple(d3){return(
d3.bin()
)}

function _bin(bin_ckmeans2){return(
bin_ckmeans2
)}

function _t(compute_t,checkboxes){return(
compute_t(checkboxes)
)}

function _label_ref(reference_select){return(
({
  actions: "#changes →",
  mappings: "#mappings →",
  tree: "#nodes →",
})[reference_select]
)}

function _compute_ref(refs,reference_select){return(
refs[reference_select]
)}

function _refs(actions_per_input){return(
{
  actions: d => d.actions == -1 ? actions_per_input.get(d.project).get(d.input) : d.actions,
  mappings: d => d.mappings,
  tree: d => (d.src_s+d.dst_s)/2,
}
)}

function _refs_raw(actions_per_input){return(
{
  actions: d => actions_per_input.get(d.project).get(d.input),
  mappings: d => d.mappings,
  tree: d => (d.src_s+d.dst_s)/2,
}
)}

function _81(md){return(
md`### Box plot utils`
)}

function _raw_bined(bin,compute_ref,data){return(
(bin.value(compute_ref))(data)
)}

function _thresholds(raw_bined){return(
raw_bined.map(x=>x.x0).slice(1)
)}

function _84(raw_bined){return(
raw_bined.map(x=>x.x1).slice(1)
)}

function _x1_max(raw_bined,d3,compute_ref){return(
raw_bined.slice(0).map(x=>d3.max(x.map(compute_ref)))
)}

function _86(d3,thresholds,x1_max,raw_bined){return(
d3.zip(thresholds,x1_max,raw_bined.map(x=>x.x1))
)}

function _bined(raw_bined,d3){return(
raw_bined.map(x=>[...d3.group(x,x=>x.project,x=>x.kind)].map(y=>
[...y[1]].map(z=>                                                                                          
  ({x0:x.x0,x1:x.x1,project:y[0],kind:z[0],values:z[1]})
      ).flat()).flat()).flat()
)}

function _bined_with_actions(raw_bined,d3){return(
raw_bined.map(x =>    
  d3.rollups(x,d=>d,d=>d.project,d=>d.input).map(([project,v])=>v.map(([input,v])=>v).filter(x=>!x.some(d=>d.actions<0&&d.kind==="java_gumtree")).flat()).flat()
)
)}

function _89(bined_with_actions,d3){return(
bined_with_actions.map(x=>d3.rollups(x,d=>d,d=>d.project,d=>d.input))
)}

function _unbined(bined){return(
bined.map(x=>
  x.values.map(y=>({x0:x.x0,x1:x.x1,project:x.project,kind:x.kind, ...y}))
).flat()
)}

function _91(d3,data){return(
d3.group(data,d=>d.kind,d=>d.project,d=>d.input).get("java_gumtree")
)}

function _92(d3,data){return(
d3.group(data,d=>d.project,d=>d.input).get("hadoop")
)}

function _oqr(d3){return(
function oqr(values) {
  const r1 = d3.quantile(values,.025);//loqr1(values);
  const r2 = d3.quantile(values,.975);//hiqr2(values);
  return values.map((v) => (v < r1 || v > r2 ? v : NaN));
}
)}

function _loqr1(quartile1,quartile3,d3){return(
function loqr1(values, value) {
  const lo = quartile1(values, value) * 2.5 - quartile3(values, value) * 1.5;
  return d3.min(values, (d) => (d >= lo ? d : NaN));
}
)}

function _hiqr2(quartile3,quartile1,d3){return(
function hiqr2(values, value) {
  const hi = quartile3(values, value) * 2.5 - quartile1(values, value) * 1.5;
  return d3.max(values, (d) => (d <= hi ? d : NaN));
}
)}

function _quartile1(d3){return(
function quartile1(values, value) {
  return d3.quantile(values, 0.25, value);
}
)}

function _quartile3(d3){return(
function quartile3(values, value) {
  return d3.quantile(values, 0.75, value);
}
)}

function _simple(require){return(
require("simple-statistics@7")
)}

function _100(data2){return(
data2
)}

function _compute_t(){return(
checkboxes => x => 0
  + (checkboxes.find(x=>x==="subtree") ? x.topdown_t + x.prepare_topdown_t : 0)
  + (checkboxes.find(x=>x==="bottomup") ? x.bottomup_t + x.prepare_bottomup_t : 0)
  + (checkboxes.find(x=>x==="gen") ? x.gen_t + x.prepare_gen_t : 0)
)}

function _diff(){return(
(a,b)=>(a>b)?a-b:b-a
)}

function _rel_diff(){return(
(ref,x)=> {
  // const d = diff(ref,x);
  // return d/(Math.min(a,b)+d/2)
  return (x-ref)/Math.abs(ref)
}
)}

function _stdlib(require){return(
require("https://unpkg.com/@stdlib/stdlib@0.0.32/dist/stdlib-flat.min.js")
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["perfs_aws-toolkit-eclipse@1.csv", {url: new URL("./files/66b4da1aec77e6886c15745375ccb6c9dab273b9337f2713347cbfc297f31087d94e029724e623ff66e5609160ca81bd6dfc4ff0fcec22550d75ff40ce56ff0b.csv", import.meta.url), mimeType: "text/csv", toString}],
    ["perfs_gson@1.csv", {url: new URL("./files/2bb307506cfd175009e87265190baba13aa0ccd9061896ce8f7f30921b5ea9d2fb8cb894e6dd43f84897f9fe4afd2a5e94b4562da5fd4ee28bc472fbd8107359.csv", import.meta.url), mimeType: "text/csv", toString}],
    ["perfs_logging-log4j2@1.csv", {url: new URL("./files/aa7f45d2f80bde5150e7585e10edc0c8c622e0f903e9be87633de24d214dbbd73f72c7878245ecabb8e9f01bbca2518fc1b15e0b4b3e7083034db6c49dad88d6.csv", import.meta.url), mimeType: "text/csv", toString}],
    ["perfs_jenkins@1.csv", {url: new URL("./files/6f859e60a78603ab4c5e10876fbc2cd9e1b2875af59ab7d7953ee225be95caf5aad645a40e1a0abc34cd971112299f072f2eebbbccb4d6e1f192a4e163908c0a.csv", import.meta.url), mimeType: "text/csv", toString}],
    ["perfs_skywalking@1.csv", {url: new URL("./files/9cc767314931710955472ac90687adfb1c2c44025b8f468823e2671c24e4859a7065d7b5893c866a858fd84ffb517cd8eaadee43bbf17ced3a31e20d37270985.csv", import.meta.url), mimeType: "text/csv", toString}],
    ["perfs_dubbo@1.csv", {url: new URL("./files/2565f9541a42f3ff6f6f7fe95df1ccfef0016bdb1e13287afe73efdd1618f36dfb6df83d12cae45b6801e69a1dbf4cef65123c11a9f4132cfcb4dc763410970f.csv", import.meta.url), mimeType: "text/csv", toString}],
    ["perfs_guava@1.csv", {url: new URL("./files/4620d24219e3e3cc7a805d9a8fb255114716829bab655fac16b787c3873a00e7c5997558be3e6ee593306ae7bb00a54593ec5f82cd1e2391e6ccf86693b8d104.csv", import.meta.url), mimeType: "text/csv", toString}],
    ["perfs_spark@1.csv", {url: new URL("./files/427f858bfe589aa446d042181abb271b18b192185e98e04a00e697711d60d0c2cd3cbb792c2df75cc15db6a6e5ebd2790a418d5fca6fa89e9197537b501a4447.csv", import.meta.url), mimeType: "text/csv", toString}],
    ["perfs_hadoop@1.csv", {url: new URL("./files/14a7f0259e832404df1534d0e5be119266e95917ba75c52695647940f1398441e56d9d298b36c8c759acf0f59d35e9be51e7090cac771fbe307bf6eb4123aff5.csv", import.meta.url), mimeType: "text/csv", toString}],
    ["perfs_maven@1.csv", {url: new URL("./files/75ac520941028b9eca538d09c3b337d150a9a0418d0c9b5cf1cdfcf043fb949423234a6b0329f6fef4872ca0586d1b71a754402a0a1a683f7f6fc67fd274b25b.csv", import.meta.url), mimeType: "text/csv", toString}],
    ["perfs_spoon@1.csv", {url: new URL("./files/dd5718dc47be44415ea49602511b4705a3d3a810fa56ecf00a5a8da82cee0cf0a93e38b96616ebdd388ab0a2e8db2e79dac3c61ad59f70995f78b3185de399ef.csv", import.meta.url), mimeType: "text/csv", toString}],
    ["perfs_fastjson@1.csv", {url: new URL("./files/8db368eafa342b4de01296b3476eba76ca1cd413fba26ce8e5085ff296ad81e384c1013b660f710170e0628951f2d56783cfc8ae6afd9120985b3f548c0a6396.csv", import.meta.url), mimeType: "text/csv", toString}],
    ["perfs_flink@1.csv", {url: new URL("./files/6d068951c4115165e32c31604b93a04254733bad73522c7a4bc18f774a5eabdadaecc0152c29c1d855ea74ee80260f472788c34e7e29f51cc9dbdd425b74e28e.csv", import.meta.url), mimeType: "text/csv", toString}],
    ["perfs_arthas@1.csv", {url: new URL("./files/a2f176cc41c0e914a221734b3ea6dd67dcea0ae021c372ac47a32cbedfb7fb8be791c255bf3422feab55413e28ca8e9a8c974696a09d624997620ad8e114335a.csv", import.meta.url), mimeType: "text/csv", toString}],
    ["perfs_javaparser@1.csv", {url: new URL("./files/27b8309a85479c14633bd637e13ed70c42d2c0d95ba87fa83856d7668019fd9febc6c17b0ee2a36c0b26f721ad688a018becb81cc1e758186fd80dbb453ef5b8.csv", import.meta.url), mimeType: "text/csv", toString}],
    ["perfs_slf4j@1.csv", {url: new URL("./files/e94019f145e1e8670880c760ecc2f8c98387edc49e6385d2cefbfc3902d8dcc7de8ee9580d0739bebd3a55d45907c245c9a2b66d719ca382150e9a082b772e9b.csv", import.meta.url), mimeType: "text/csv", toString}],
    ["perfs_jackson-core@1.csv", {url: new URL("./files/5a02aafe7d2fc2bdb2341daf7279a8435a3fade62b09e7b7ef3a4f51211b5b5913d45ea5f3a5c6616ff72d66fc7042eaae13d5e9dd674cfbc92302aeb51c771a.csv", import.meta.url), mimeType: "text/csv", toString}],
    ["perfs_netty@2.csv", {url: new URL("./files/355e99bfc746dc636b7f0edf1394dc55bdb8e9dc2ef6f8243da3702a5606b91c4580ffd14a1b08543f9ad93473cc6490568c492a77e79a6f344a8f694d2cce49.csv", import.meta.url), mimeType: "text/csv", toString}],
    ["perfs_quarkus@2.csv", {url: new URL("./files/cb2e310e62653bb452129f0f898d193d8625947f6228cbcca79284b8835438ee296e4440829c783a4d025161f0da7626ee2fde47644947a3b9ba3b3bb88dcf0d.csv", import.meta.url), mimeType: "text/csv", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer("files")).define("files", ["FileAttachment"], _files);
  main.variable(observer("process_file")).define("process_file", ["process_entry"], _process_file);
  main.variable(observer("process_entry")).define("process_entry", _process_entry);
  main.variable(observer("data")).define("data", ["files","process_file"], _data);
  main.variable(observer("actions_per_input")).define("actions_per_input", ["d3","data"], _actions_per_input);
  main.variable(observer()).define(["data","compute_t","actions_per_input","entries_per_input"], _7);
  main.variable(observer()).define(["d3","data"], _8);
  main.variable(observer()).define(["d3","data"], _9);
  main.variable(observer()).define(["d3","data"], _10);
  main.variable(observer()).define(["data"], _11);
  main.variable(observer("bl_actions_per_input")).define("bl_actions_per_input", ["d3","data","baseline_kind"], _bl_actions_per_input);
  main.variable(observer("entries_per_input")).define("entries_per_input", ["d3","data"], _entries_per_input);
  main.variable(observer()).define(["d3","data"], _14);
  main.variable(observer()).define(["d3","data","t"], _15);
  main.variable(observer()).define(["d3","data","t"], _16);
  main.variable(observer()).define(["d3","data","t"], _17);
  main.variable(observer()).define(["d3","data"], _18);
  main.variable(observer()).define(["d3","data"], _19);
  main.variable(observer()).define(["d3","data"], _20);
  main.variable(observer()).define(["d3","data"], _21);
  main.variable(observer()).define(["d3","data"], _22);
  main.variable(observer()).define(["d3","data"], _23);
  main.variable(observer()).define(["d3","data"], _24);
  main.variable(observer()).define(["d3","data"], _25);
  main.variable(observer()).define(["d3","data"], _26);
  main.variable(observer()).define(["bl_actions_per_input"], _27);
  main.variable(observer()).define(["d3","data","bl_actions_per_input"], _28);
  main.variable(observer("entries_per_input_and_kind")).define("entries_per_input_and_kind", ["d3","data"], _entries_per_input_and_kind);
  main.variable(observer()).define(["d3","data"], _30);
  main.variable(observer()).define(["data"], _31);
  main.variable(observer("timeout_per_input")).define("timeout_per_input", ["d3","data"], _timeout_per_input);
  main.variable(observer("viewof search")).define("viewof search", ["Inputs","data"], _search);
  main.variable(observer("search")).define("search", ["Generators", "viewof search"], (G, _) => G.input(_));
  main.variable(observer()).define(["Inputs","search","d3"], _34);
  main.variable(observer("data2")).define("data2", ["data"], _data2);
  main.variable(observer("data_diff")).define("data_diff", ["d3","data","baseline_kind","rel_diff","t"], _data_diff);
  main.variable(observer()).define(["data","diff"], _37);
  main.variable(observer()).define(["data"], _38);
  main.variable(observer("bad")).define("bad", ["data"], _bad);
  main.variable(observer()).define(["Inputs","bad"], _40);
  main.variable(observer()).define(["bad","data"], _41);
  main.variable(observer()).define(["Plot","data","d3"], _42);
  main.variable(observer()).define(["Plot","data","compute_t","checkboxes","t","label_ref"], _44);
  main.variable(observer()).define(["fix_bp","Plot","unbined","d3","x1_max","label_ref","refs","oqr","t","format_time","bp_text","bp_text2"], _45);
  main.variable(observer("viewof checkboxes")).define("viewof checkboxes", ["Inputs"], _checkboxes);
  main.variable(observer("checkboxes")).define("checkboxes", ["Generators", "viewof checkboxes"], (G, _) => G.input(_));
  main.variable(observer("viewof prep_options")).define("viewof prep_options", ["Inputs"], _prep_options);
  main.variable(observer("prep_options")).define("prep_options", ["Generators", "viewof prep_options"], (G, _) => G.input(_));
  main.variable(observer("viewof reference_select")).define("viewof reference_select", ["Inputs"], _reference_select);
  main.variable(observer("reference_select")).define("reference_select", ["Generators", "viewof reference_select"], (G, _) => G.input(_));
  main.variable(observer()).define(["html","my_main","match_inter","refs","other_plot_opts"], _49);
  main.variable(observer("match_inter")).define("match_inter", _match_inter);
  main.variable(observer("other_plot_opts")).define("other_plot_opts", _other_plot_opts);
  main.variable(observer("my_main")).define("my_main", ["fix_bp","Plot","unbined","d3","x1_max","label_ref","my_bp","filter_wrong"], _my_main);
  main.variable(observer("filter_wrong")).define("filter_wrong", ["t","checkboxes"], _filter_wrong);
  main.variable(observer("my_bp")).define("my_bp", ["Plot","unbined","oqr","t","format_time","d3","bp_text2"], _my_bp);
  main.variable(observer("bp_text")).define("bp_text", ["d3"], _bp_text);
  main.variable(observer("bp_text2")).define("bp_text2", ["baseline_kind","bp_text2_aux","entries_per_input_and_kind","t","format_time","d3"], _bp_text2);
  main.variable(observer("bp_text2_aux")).define("bp_text2_aux", ["baseline_kind","entries_per_input_and_kind","rel_diff","t","d3","stdlib"], _bp_text2_aux);
  main.variable(observer("baseline_kind")).define("baseline_kind", _baseline_kind);
  main.variable(observer("fix_bp")).define("fix_bp", _fix_bp);
  main.variable(observer()).define(["Plot","unbined","compute_t","checkboxes"], _60);
  main.variable(observer()).define(["Plot","data","format_time","d3","t"], _61);
  main.variable(observer("chunk")).define("chunk", _chunk);
  main.variable(observer("text_heatmap")).define("text_heatmap", ["d3","chunk"], _text_heatmap);
  main.variable(observer()).define(["Plot","d3","data_diff","format_time","t","refs"], _64);
  main.variable(observer()).define(["Plot","data","format_time","d3","t"], _65);
  main.variable(observer("format_time")).define("format_time", ["d3"], _format_time);
  main.variable(observer()).define(["format_time"], _67);
  main.variable(observer("dd")).define("dd", _dd);
  main.variable(observer()).define(["dd"], _69);
  main.variable(observer()).define(["d3"], _70);
  main.variable(observer("bin_ckmeans")).define("bin_ckmeans", ["d3","simple"], _bin_ckmeans);
  main.variable(observer("bin_ckmeans2")).define("bin_ckmeans2", ["d3","simple"], _bin_ckmeans2);
  main.variable(observer("bin_simple")).define("bin_simple", ["d3"], _bin_simple);
  main.variable(observer("bin")).define("bin", ["bin_ckmeans2"], _bin);
  main.variable(observer("t")).define("t", ["compute_t","checkboxes"], _t);
  main.variable(observer("label_ref")).define("label_ref", ["reference_select"], _label_ref);
  main.variable(observer("compute_ref")).define("compute_ref", ["refs","reference_select"], _compute_ref);
  main.variable(observer("refs")).define("refs", ["actions_per_input"], _refs);
  main.variable(observer("refs_raw")).define("refs_raw", ["actions_per_input"], _refs_raw);
  const child1 = runtime.module(define1);
  main.import("Plot", child1);
  main.variable(observer()).define(["md"], _81);
  main.variable(observer("raw_bined")).define("raw_bined", ["bin","compute_ref","data"], _raw_bined);
  main.variable(observer("thresholds")).define("thresholds", ["raw_bined"], _thresholds);
  main.variable(observer()).define(["raw_bined"], _84);
  main.variable(observer("x1_max")).define("x1_max", ["raw_bined","d3","compute_ref"], _x1_max);
  main.variable(observer()).define(["d3","thresholds","x1_max","raw_bined"], _86);
  main.variable(observer("bined")).define("bined", ["raw_bined","d3"], _bined);
  main.variable(observer("bined_with_actions")).define("bined_with_actions", ["raw_bined","d3"], _bined_with_actions);
  main.variable(observer()).define(["bined_with_actions","d3"], _89);
  main.variable(observer("unbined")).define("unbined", ["bined"], _unbined);
  main.variable(observer()).define(["d3","data"], _91);
  main.variable(observer()).define(["d3","data"], _92);
  main.variable(observer("oqr")).define("oqr", ["d3"], _oqr);
  main.variable(observer("loqr1")).define("loqr1", ["quartile1","quartile3","d3"], _loqr1);
  main.variable(observer("hiqr2")).define("hiqr2", ["quartile3","quartile1","d3"], _hiqr2);
  main.variable(observer("quartile1")).define("quartile1", ["d3"], _quartile1);
  main.variable(observer("quartile3")).define("quartile3", ["d3"], _quartile3);
  main.variable(observer("simple")).define("simple", ["require"], _simple);
  const child2 = runtime.module(define2);
  main.import("BoxPlot", child2);
  main.variable(observer()).define(["data2"], _100);
  main.variable(observer("compute_t")).define("compute_t", _compute_t);
  main.variable(observer("diff")).define("diff", _diff);
  main.variable(observer("rel_diff")).define("rel_diff", _rel_diff);
  main.variable(observer("stdlib")).define("stdlib", ["require"], _stdlib);
  return main;
}
