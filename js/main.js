let data = []
const yMax = 25;
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul","Aug", "Sep", "Oct", "Nov", "Dec"];

const state = {
  minThreshold: 3,
  selectedYear: 2018
}

fetch('./data/data.json')
  .then(function(response) {
    return response.json()
  })
  .then(function(json) {
    data = json;
    const yearSelect = document.querySelector('.js-year-select');
    const countSelect = document.querySelector('.js-count-select');
    countSelect.append(...buildCountOptions(data));
    yearSelect.append(...buildYearOptions(data));
    render();
  });

const createDateFromStr = str => new Date(str);
const getHeightPercentage = value => value/yMax * 100;

const createOption = (value, selected) => {
  const option = document.createElement('option');
  option.value = value;
  option.textContent = value;
  if (selected == value) {
    option.setAttribute('selected', '');
  }
  return option
}

//This is for scalability: in the case that the data set goes beyond 2 years.
const buildYearOptions = (data) => {
  const years = data.map(incident => {
    const { incident_date } = incident;
    const incidentDate = createDateFromStr(incident_date);
    const incidentYear = incidentDate.getFullYear();
    return incidentYear
  });
  const max = Math.max(...years);
  const min = Math.min(...years);
  const selects = [];
  for(let i = min; i <= max; i++) {
    selects.push(createOption(i, state.selectedYear))
  }
  return selects
}

const buildCountOptions = (data) => {
  const counts = data.map(incident => incident.num_killed);
  const maxCount = Math.max(...counts);
  const selects = [];
  for(let i = 1; i <= maxCount; i++) {
    selects.push(createOption(i, state.minThreshold))
  }
  return selects
}
const createBar = (title, value, index) => {
  const wrapperDiv = document.createElement('div');
  const valueDiv =  document.createElement('div');
  const titleDiv =  document.createElement('div');

  wrapperDiv.classList.add('Bar');
  wrapperDiv.style.cssText = `grid-column:${index + 2} / span 1;`;
  valueDiv.classList.add('Bar-value');
  valueDiv.style.cssText = `--data-y:${getHeightPercentage(value)}%;`;
  titleDiv.classList.add('Bar-title');
  titleDiv.textContent = title;
  wrapperDiv.append(valueDiv, titleDiv);
  return wrapperDiv
}

const sortByMonth = (data) => {
  let chartData = [];

  for(let i = 0; i < 12; i++) {
    const dataByMonth = data.filter((obj) => {
      const incidentDate = createDateFromStr(obj.incident_date);
      const incidentMonth = incidentDate.getMonth();
      return incidentMonth === i
    });
    chartData.push({month: months[i], total_incidents: dataByMonth.length});
  }
  return chartData
}

const onChangeHandler = (value, stateKey) => {
  state[stateKey] = Number(value);
  render();
};

const render = () => {
  const {minThreshold, selectedYear} = state;

  const filteredData = data.filter(incident => {
    const { num_killed, incident_date } = incident;
    const incidentDate = createDateFromStr(incident_date);
    const incidentYear = incidentDate.getFullYear();
    return num_killed >= minThreshold && incidentYear === selectedYear
  });

  const barNodes = sortByMonth(filteredData).map((item, index )=> {
    const {month, total_incidents} = item;
    return createBar(month, total_incidents, index);
  });

  const barsWrapper = document.querySelector('.js-Bars');

  barsWrapper.innerHTML = "";
  barsWrapper.append(...barNodes);
}
