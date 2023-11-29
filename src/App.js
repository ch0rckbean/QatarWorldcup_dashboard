/*jshint esversion: 6 */

import React, { startTransition, useState, useRef, useEffect } from 'react';
import flag from './imgs/Q.jpg';
import logo from './imgs/logo.png';

import './style.css';
import * as d3 from 'd3';

import dataset_csv from './data/dataset.csv';
import mapping_csv from './data/nations-mapping.csv';
import overall_mean_csv from './data/overall-mean.csv';
import fifa_rank_csv from './data/FIFA_Ranking.csv';

import TopPlayerRadar from './nation_ability/TopPlayerRadar';
import Wrapper from './Wrapper';
import TopFlag from './nation_ability/TopFlag';
import TopPlayerInfo from './nation_ability/TopPlayerInfo';
import CompareChart from './nation_ability/CompareChart';

import Graph from './nation_ability/LineGraph2';

let nationMapping = null;
let overallMeanData = null;
let fifaRankData = null;
let isLoaded = false;

function App(props) {
  // csv파일 읽어서 저장할 공간
  const [dataset, setDataset] = useState([]);
  // 선택한 나라를 담을 변수
  const [nations, setNations] = useState([]);

  const GetDataOnce = async () => {
    nationMapping = await d3.csv(mapping_csv);
    overallMeanData = await d3.csv(overall_mean_csv);
    fifaRankData = await d3.csv(fifa_rank_csv);
    isLoaded = true;
  };
  if (!isLoaded) GetDataOnce();
  const GetDataset = async () => {
    let data = await d3.csv(dataset_csv);

    if (nations.length == 1) {
      setDataset(data.filter((v) => v.nationality_name == nations[0]));
      console.log(data);
      console.log(data.filter((v) => v.nationality_name == nations[0]));
      console.log(nations);
    } else if (nations.length == 2) {
      setDataset([
        ...data.filter((v) => v.nationality_name == nations[0]),
        ...data.filter((v) => v.nationality_name == nations[1]),
      ]);
    } else {
      setDataset([]);
    }
  };

  useEffect(() => {
    GetDataset();
  }, [nations]);

  //FILTER
  const onClickNations = (e) => {
    // 1. 중복확인
    if (nations.indexOf(e) >= 0) {
      for (let j = 0; j < nations.length; j++) {
        let selectNation =
          nationMapping[
            nationMapping
              .map((v, i, s) => v.nationality_name == e)
              .indexOf(true)
          ].value;
        let index = nationMapping
          .map((v, i, s) => v.nationality_name == e)
          .indexOf(true);
        let btn = document.getElementsByName('Group')[index].parentElement;
        btn.style.border = '';
        btn.style.borderRadius = '';
      }

      const leftNation = [...nations.filter((v) => v != e)];
      setNations([...nations.filter((v) => v != e)]);

      if (leftNation.length > 0) {
        console.log(nations);
        let selectNation =
          nationMapping[
            nationMapping
              .map((v, i, s) => v.nationality_name == leftNation[0])
              .indexOf(true)
          ].value;
        console.log(selectNation);
        let index = nationMapping
          .map((v, i, s) => v.nationality_name == leftNation[0])
          .indexOf(true);
        let btn = document.getElementsByName('Group')[index].parentElement;
        btn.style.border = '4px solid #701936';
        btn.style.borderRadius = '10%';

        console.log(nations.length);
      }
    }
    // 2. 길이확인
    else if (nations.length < 2) {
      setNations([...nations, e]);

      const selectNation =
        nationMapping[
          nationMapping.map((v, i, s) => v.nationality_name == e).indexOf(true)
        ].value;
      const index = nationMapping
        .map((v, i, s) => v.nationality_name == e)
        .indexOf(true);
      // console.log(selectNation)
      // console.log(index)
      // console.log(document.getElementsByName("Group")[index].parentElement)
      let btn = document.getElementsByName('Group')[index].parentElement;
      if (nations.length == 0) {
        btn.style.border = '4px solid #701936'; // first
        btn.style.borderRadius = '10%';
      } else {
        btn.style.border = '4px solid #C14D4D'; // second
        btn.style.borderRadius = '10%';
      }
    }
  };
  const svgRef = useRef(null);

  function TopChart(props) {
    let abilitys = [];
    const moveXaxis = 20;

    useEffect(() => {
      const svg = d3.select(svgRef.current);
      const xScale = d3.scaleLinear().domain([0, 100]).range([0, 350]);

      const yScale = d3
        .scaleBand() // 단순 용도인듯.
        .domain(abilitys.map((v) => v.ability_name)) // map은 순서를 알려주는 것 같음.
        .range([0, 370])
        .padding(0.45); // 막대그래프 굵기 조걸

      const yAxis = d3.axisLeft(yScale).ticks(abilitys.length);

      svg
        .select('.y-axis')
        .style('transform', 'translateX(' + moveXaxis + 'px)')
        // .style("font", "20px times")
        .call(yAxis); // 폰트 크기 조절

      // console.log(abilitys)
      svg
        .selectAll('bar')
        .data(abilitys)
        .join('rect')
        .attr('class', 'nation-chart-bar') // 속석은 바차트

        .attr('x', (v) => moveXaxis + 1) // barchart의 기준 x값
        .attr('y', (v) => yScale(v.ability_name)) // barchart의 기준 y값

        .attr('width', (v) => xScale(v.ability_value) + moveXaxis) // 바의 너비 조절
        .attr('height', (v) => yScale.bandwidth()) // 바의 높이 조절
        .attr('fill', '#70193D') // 바차트 내부 채우기

        .on('mouseover', mouseover)
        .on('mouseout', mouseout);
      // .on("mousemove", mousemove)

      function mousemove(e) {
        tooltip.attr('x', e.offsetX + 30).attr('y', e.offsetY + 30);
      }

      function mouseover(e, v) {
        svg.selectAll('rect').attr('fill', '#F5DBDB');
        // .attr("opacity", "0.5")
        d3.select(this).attr('fill', '#50001D');
        tooltip
          .style('visibility', 'visible')
          // .attr("opacity", "0")
          .text(v.ability_value)
          // .attr("x",  e.screenX - e.offsetX + moveXaxis + 100)
          .attr('x', e.target.width.animVal.value + moveXaxis - 20)
          .attr('y', e.target.y.animVal.value + 17);
        // console.log(e.target)
        // console.log(e.target.x.animVal.value)
        // console.log(e.offsetX)
        // console.log(e.offsetY)
        // svg.selectAll("text").attr("font-weight", "bold")
      }
      function mouseout(e) {
        svg.selectAll('rect').attr('fill', '#70193D');
        // .attr("opacity", "1")
        d3.select(this).attr('fill', '#70193D');
        tooltip.style('visibility', 'hidden');
        // .text("dsfdfdsfdsdf")
      }

      let tooltip = svg
        .append('text')
        .attr('class', 'tool-tip')
        .style('position', 'absolute')
        .style('border-radius', '4px 4px 4px 4px')
        .style('background-color', '#E2E2E2')
        .style('visibility', 'hidden')
        .style('font-size', '16px')
        .style('text-anchor', 'middle')
        .style('margin', '30px')
        .attr('class', 'tooltip')
        .style('fill', 'white');
    }, []);

    if (props.data == null) return '<></>';
    if (props.data.length == 0) return '<></>';

    const data = props.data
      .filter((v) => v.nationality_name == props.nationality_name)
      .filter((v) => parseInt(v.pace) != 0);

    if (data.length == 0) {
      return '<></>';
    }

    for (let i = 0; i < 6; i++) {
      let newAbility = { ability_name: '', ability_value: 0 };
      newAbility.ability_name = Object.keys(data[i])[i + 37];
      for (let j = 0; j < 10; j++) {
        newAbility.ability_value =
          parseInt(newAbility.ability_value) +
          parseInt(data[i][newAbility.ability_name]);
      }
      // console.log(newAbility.ability_value)
      newAbility.ability_value = parseInt(newAbility.ability_value / 10);
      abilitys[abilitys.length] = newAbility;
    }

    return (
      <>
        {/* <div className='div_right_top_bar'> */}
        <svg ref={svgRef} height='500px' width='630px' viewBox='0 0 390 400'>
          <g className='y-axis'></g>
        </svg>
        {/* </div> */}
      </>
    );
  }

  // 국가 리스트
  const nationListA = [
    {
      className: 'group_infoA1',
      evtParam: 'Qatar',
      id: 'A1',
      src: flag,
      value: '카타르',
    },
    {
      className: 'group_infoA2',
      evtParam: 'Ecuador',
      id: 'A2',
      src: 'https://cdn.sofifa.net/flags/ec.png',
      value: '에콰도르',
    },
    {
      className: 'group_infoA3',
      evtParam: 'Senegal',
      id: 'A3',
      src: 'https://cdn.sofifa.net/flags/sn.png',
      value: '세네갈',
    },
    {
      className: 'group_infoA4',
      evtParam: 'Netherlands',
      id: 'A4',
      src: 'https://cdn.sofifa.net/flags/sn.png',
      value: '네덜란드',
    },
  ];

  const nationListB = [
    {
      className: 'group_infoB1',
      evtParam: 'England',
      id: 'B1',
      src: 'https://cdn.sofifa.net/flags/gb-eng.png',
      value: '잉글랜드',
    },
    {
      className: 'group_infoB2',
      evtParam: 'Iran',
      id: 'B2',
      src: 'https://cdn.sofifa.net/flags/ir.png',
      value: '이란',
    },
    {
      className: 'group_infoB3',
      evtParam: 'United States',
      id: 'B3',
      src: 'https://cdn.sofifa.net/flags/us.png',
      value: '미국',
    },
    {
      className: 'group_infoB4',
      evtParam: 'Wales',
      id: 'B4',
      src: 'https://cdn.sofifa.net/flags/gb-wls.png',
      value: '웨일스',
    },
  ];

  const nationListC = [
    {
      className: 'group_infoC1',
      evtParam: 'Argentina',
      id: 'C1',
      src: 'https://cdn.sofifa.net/flags/ar.png',
      value: '아르헨티나',
    },
    {
      className: 'group_infoC2',
      evtParam: 'Saudi Arabia',
      id: 'C2',
      src: 'https://cdn.sofifa.net/flags/sa.png',
      value: '사우디아라비아',
    },
    {
      className: 'group_infoC3',
      evtParam: 'Mexico',
      id: 'C3',
      src: 'https://cdn.sofifa.net/flags/mx.png',
      value: '멕시코',
    },
    {
      className: 'group_infoC4',
      evtParam: 'Poland',
      id: 'C4',
      src: 'https://cdn.sofifa.net/flags/pl.png',
      value: '폴란드',
    },
  ];

  const nationListD = [
    {
      className: 'group_infoD1',
      evtParam: 'rance',
      id: 'D1',
      src: 'https://cdn.sofifa.net/flags/fr.png',
      value: '프랑스',
    },
    {
      className: 'group_infoD2',
      evtParam: 'Australia',
      id: 'D2',
      src: 'https://cdn.sofifa.net/flags/au.png',
      value: '호주',
    },
    {
      className: 'group_infoD3',
      evtParam: 'Denmark',
      id: 'D3',
      src: 'https://cdn.sofifa.net/flags/dk.png',
      value: '덴마크',
    },
    {
      className: 'group_infoD4',
      evtParam: 'Tunisia',
      id: 'D4',
      src: 'https://cdn.sofifa.net/flags/tn.png',
      value: '튀니지',
    },
  ];

  const nationListE = [
    {
      className: 'group_infoE1',
      evtParam: 'Spain',
      id: 'E1',
      src: 'https://cdn.sofifa.net/flags/es.png',
      value: '스페인',
    },
    {
      className: 'group_infoE2',
      evtParam: 'Costa Rica',
      id: 'E2',
      src: 'https://cdn.sofifa.net/flags/cr.png',
      value: '코스타리카',
    },
    {
      className: 'group_infoE3',
      evtParam: 'Germany',
      id: 'E3',
      src: 'https://cdn.sofifa.net/flags/de.png',
      value: '독일',
    },
    {
      className: 'group_infoE4',
      evtParam: 'apan',
      id: 'E4',
      src: 'https://cdn.sofifa.net/flags/jp.png',
      value: '일본',
    },
  ];

  const nationListF = [
    {
      className: 'group_infoF1',
      evtParam: 'Belgium',
      id: 'F1',
      src: 'https://cdn.sofifa.net/flags/be.png',
      value: '벨기에',
    },
    {
      className: 'group_infoF2',
      evtParam: 'Canada',
      id: 'F2',
      src: 'https://cdn.sofifa.net/flags/ca.png',
      value: '캐나다',
    },
    {
      className: 'group_infoF3',
      evtParam: 'Morocco',
      id: 'F3',
      src: 'https://cdn.sofifa.net/flags/ma.png',
      value: '모로코',
    },
    {
      className: 'group_infoF4',
      evtParam: 'Croatia',
      id: 'F4',
      src: 'https://cdn.sofifa.net/flags/hr.png',
      value: '크로아티아',
    },
  ];

  const nationListG = [
    {
      className: 'group_infoG1',
      evtParam: 'Brazil',
      id: 'G1',
      src: 'https://cdn.sofifa.net/flags/br.png',
      value: '브라질',
    },
    {
      className: 'group_infoG2',
      evtParam: 'Serbia',
      id: 'G2',
      src: 'https://cdn.sofifa.net/flags/rs.png',
      value: '세르비아',
    },
    {
      className: 'group_infoG3',
      evtParam: 'Switzerland',
      id: 'G3',
      src: 'https://cdn.sofifa.net/flags/ch.png',
      value: '스위스',
    },
    {
      className: 'group_infoG4',
      evtParam: 'Cameroon',
      id: 'G4',
      src: 'https://cdn.sofifa.net/flags/cm.png',
      value: '카메룬',
    },
  ];

  const nationListH = [
    {
      className: 'group_infoH1',
      evtParam: 'Portugal',
      id: 'H1',
      src: 'https://cdn.sofifa.net/flags/pt.png',
      value: '포르투갈',
    },
    {
      className: 'group_infoH2',
      evtParam: 'Gana',
      id: 'H2',
      src: 'https://cdn.sofifa.net/flags/gh.png',
      value: '가나',
    },
    {
      className: 'group_infoH3',
      evtParam: 'Uruguay',
      id: 'H3',
      src: 'https://cdn.sofifa.net/flags/uy.png',
      value: '우르과이',
    },
    {
      className: 'group_infoH4',
      evtParam: 'Korea Republic',
      id: 'H4',
      src: 'https://cdn.sofifa.net/flags/kr.png',
      value: '대한민국',
    },
  ];

  return (
    <>
      {/* LAYOUT */}
      <Wrapper>
        <div className='LEFT'>
          <div className='left_up'>
            {/* <p>{nations}</p> */}
            <img width='100%' src={logo} alt='logo_img' id='logoImg'></img>
          </div>{' '}
          {/*left_up*/}
          {/* LEFTDOWN */}
          <div className='left_down'>
            <div className='LeftBottom2'>
              <div className='box1'>
                <b>
                  <h3 id='group1'>그룹A</h3>
                </b>
                <div className='group_infos'>
                  {nationListA.map((nationA) => {
                    return (
                      <div className={nationA.className} key={nationA.id}>
                        <button
                          onClick={() => onClickNations(nationA.evtParam)}
                          id={nationA.id}
                          value={nationA.value}
                          name='Group'
                        >
                          <img width='30%' src={nationA.src} alt='국가 사진' />
                          <p>{nationA.value}</p>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className='box2'>
                <b>
                  <h3 id='group2'>그룹B</h3>
                </b>
                <div className='group_infos'>
                  {nationListB.map((nationB) => {
                    return (
                      <div className={nationB.className} key={nationB.id}>
                        <button
                          onClick={() => onClickNations(nationB.evtParam)}
                          id={nationB.id}
                          value={nationB.value}
                          name='Group'
                        >
                          <img width='30%' src={nationB.src} alt='국가 사진' />
                          <p>{nationB.value}</p>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className='LeftBottom3'>
              <div class='box3'>
                <b>
                  <h3 id='group3'>그룹C</h3>
                </b>
                <div className='group_infos'>
                  {nationListC.map((nationC) => {
                    return (
                      <div className={nationC.className} key={nationC.id}>
                        <button
                          onClick={() => onClickNations(nationC.evtParam)}
                          id={nationC.id}
                          value={nationC.value}
                          name='Group'
                        >
                          <img width='30%' src={nationC.src} alt='국가 사진' />
                          <p>{nationC.value}</p>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div class='box4'>
                <b>
                  <h3 id='group4'>그룹D</h3>
                </b>
                <div className='group_infos'>
                  {nationListD.map((nationD) => {
                    return (
                      <div className={nationD.className} key={nationD.id}>
                        <button
                          onClick={() => onClickNations(nationD.evtParam)}
                          id={nationD.id}
                          value={nationD.value}
                          name='Group'
                        >
                          <img width='30%' src={nationD.src} alt='국가 사진' />
                          <p>{nationD.value}</p>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className='LeftBottom4'>
              <div class='box5'>
                <b>
                  <h3 id='group5'>그룹E</h3>
                </b>
                <div className='group_infos'>
                  {nationListE.map((nationE) => {
                    return (
                      <div className={nationE.className} key={nationE.id}>
                        <button
                          onClick={() => onClickNations(nationE.evtParam)}
                          id={nationE.id}
                          value={nationE.value}
                          name='Group'
                        >
                          <img width='30%' src={nationE.src} alt='국가 사진' />
                          <p>{nationE.value}</p>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div class='box6'>
                <b>
                  <h3 id='group6'>그룹F</h3>
                </b>
                <div className='group_infos'>
                  {nationListF.map((nationF) => {
                    return (
                      <div className={nationF.className} key={nationF.id}>
                        <button
                          onClick={() => onClickNations(nationF.evtParam)}
                          id={nationF.id}
                          value={nationF.value}
                          name='Group'
                        >
                          <img width='30%' src={nationF.src} alt='국가 사진' />
                          <p>{nationF.value}</p>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className='LeftBottom5'>
              <div className='box7'>
                <b>
                  <h3 id='group7'>그룹G</h3>
                </b>
                <div className='group_infos'>
                  {nationListG.map((nationG) => {
                    return (
                      <div className={nationG.className} key={nationG.id}>
                        <button
                          onClick={() => onClickNations(nationG.evtParam)}
                          id={nationG.id}
                          value={nationG.value}
                          name='Group'
                        >
                          <img width='30%' src={nationG.src} alt='국가 사진' />
                          <p>{nationG.value}</p>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className='box8'>
                <b>
                  <h3 id='group8'>그룹H</h3>
                </b>
                <div className='group_infos'>
                  {nationListH.map((nationH) => {
                    return (
                      <div className={nationH.className} key={nationH.id}>
                        <button
                          onClick={() => onClickNations(nationH.evtParam)}
                          id={nationH.id}
                          value={nationH.value}
                          name='Group'
                        >
                          <img width='30%' src={nationH.src} alt='국가 사진' />
                          <p>{nationH.value}</p>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          {/*left_down*/}
        </div>
        {/*LEFT */}

        <div className='RIGHT'>
          <div className='div_right'>
            {nations.length == 0 ? <h1>국가를 선택해주세요!</h1> : <></>}
            {nations.length > 0 ? (
              <>
                <div className='div_right_top'>
                  <TopFlag
                    nationality_name={nations[0]}
                    data={dataset}
                    mapping={nationMapping}
                    ranking={fifaRankData}
                    overall_mean={overallMeanData}
                  />
                  <TopChart nationality_name={nations[0]} data={dataset} />
                </div>

                <div className='div_right_bottom'>
                  <div className='div_right_bottom_split'>
                    <div className='top_player'>
                      <div className='top_player_face'>
                        <TopPlayerInfo
                          data={dataset}
                          player_number={0}
                          nationality_name={nations[0]}
                          mapping={nationMapping}
                        />
                      </div>
                      <div className='top_player_hexagon'>
                        <TopPlayerRadar
                          data={dataset}
                          player_number={0}
                          nationality_name={nations[0]}
                        />
                      </div>
                    </div>
                    <div className='top_player_ability'>
                      {/* <h2>top_player_ability</h2> */}
                    </div>
                  </div>
                  <div className='div_right_bottom_split'>
                    <div className='top_player'>
                      <div className='top_player_face'>
                        <TopPlayerInfo
                          data={dataset}
                          player_number={1}
                          nationality_name={nations[0]}
                          mapping={nationMapping}
                        />
                      </div>
                      <div className='top_player_hexagon'>
                        <TopPlayerRadar
                          data={dataset}
                          player_number={1}
                          nationality_name={nations[0]}
                        />
                      </div>
                    </div>
                    <div className='top_player_ability'>
                      {/* <h2>top_player_ability</h2> */}
                    </div>
                  </div>
                  <div className='div_right_bottom_split'>
                    <div className='top_player'>
                      <div className='top_player_face'>
                        <TopPlayerInfo
                          data={dataset}
                          player_number={2}
                          nationality_name={nations[0]}
                          mapping={nationMapping}
                        />
                      </div>
                      <div className='top_player_hexagon'>
                        <TopPlayerRadar
                          data={dataset}
                          player_number={2}
                          nationality_name={nations[0]}
                        />
                      </div>
                    </div>
                    <div className='top_player_ability'>
                      {/* <h2>top_player_ability</h2> */}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <></>
            )}

            {nations.length > 1 ? (
              <>
                <div className='div_right_top'>
                  <TopFlag
                    nationality_name={nations[1]}
                    data={dataset}
                    mapping={nationMapping}
                    ranking={fifaRankData}
                    overall_mean={overallMeanData}
                  />
                  {/* <NationAbilityTopChart nation_index={1} /> */}
                  <TopChart nationality_name={nations[1]} data={dataset} />
                </div>
                <div className='div_right_bottom'>
                  <div className='div_right_bottom_split'>
                    <div className='top_player'>
                      <div className='top_player_face'>
                        <TopPlayerInfo
                          data={dataset}
                          player_number={0}
                          nationality_name={nations[1]}
                          mapping={nationMapping}
                        />
                      </div>
                      <div className='top_player_hexagon'>
                        <TopPlayerRadar
                          data={dataset}
                          player_number={0}
                          nationality_name={nations[1]}
                        />
                      </div>
                    </div>
                    <div className='top_player_ability'>
                      {/* <h2>top_player_ability</h2> */}
                    </div>
                  </div>
                  <div className='div_right_bottom_split'>
                    <div className='top_player'>
                      <div className='top_player_face'>
                        <TopPlayerInfo
                          data={dataset}
                          player_number={1}
                          nationality_name={nations[1]}
                          mapping={nationMapping}
                        />
                      </div>
                      <div className='top_player_hexagon'>
                        <TopPlayerRadar
                          data={dataset}
                          player_number={1}
                          nationality_name={nations[1]}
                        />
                      </div>
                    </div>
                    <div className='top_player_ability'>
                      {/* <h2>top_player_ability</h2> */}
                    </div>
                  </div>
                  <div className='div_right_bottom_split'>
                    <div className='top_player'>
                      <div className='top_player_face'>
                        <TopPlayerInfo
                          data={dataset}
                          player_number={2}
                          nationality_name={nations[1]}
                          mapping={nationMapping}
                        />
                      </div>
                      <div className='top_player_hexagon'>
                        <TopPlayerRadar
                          data={dataset}
                          player_number={2}
                          nationality_name={nations[1]}
                        />
                      </div>
                    </div>
                    <div className='top_player_ability'>
                      {/* <h2>top_player_ability</h2> */}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <></>
            )}
          </div>
          {/*div_right 첫번째 국가  -> 자동 선택되게 만들었습니다~*/}
          <div className='grade_overall'>
            {nations.length > 1 ? (
              <>
                <div className='grade_overall_chart'>
                  <div className='overall'>
                    <CompareChart
                      nations={nations}
                      mapping={nationMapping}
                      data={overallMeanData}
                    />
                  </div>
                  <div className='grade'>
                    <Graph compare={nations} />
                  </div>
                </div>
              </>
            ) : (
              <></>
            )}
          </div>{' '}
          {/*과거 성적 비교 */}
        </div>
        {/*RIGHT*/}
      </Wrapper>
    </>
  );
}

export default App;
