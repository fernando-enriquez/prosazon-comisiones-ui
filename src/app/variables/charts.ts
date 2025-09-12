import {
  Chart,
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  BarController,
  BubbleController,
  DoughnutController,
  LineController,
  PieController,
  PolarAreaController,
  RadarController,
  ScatterController,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  RadialLinearScale,
  TimeScale,
  TimeSeriesScale,
  Decimation,
  Filler,
  Legend,
  Title,
  Tooltip,
  SubTitle
} from 'chart.js';

Chart.register(
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  BarController,
  BubbleController,
  DoughnutController,
  LineController,
  PieController,
  PolarAreaController,
  RadarController,
  ScatterController,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  RadialLinearScale,
  TimeScale,
  TimeSeriesScale,
  Decimation,
  Filler,
  Legend,
  Title,
  Tooltip,
  SubTitle,
);

export function chartOptions() {
  Chart.defaults.responsive = true
  Chart.defaults.maintainAspectRatio = false
  Chart.defaults.color = '#8898aa'
  Chart.defaults.font.family = "Open Sans"
  Chart.defaults.font.size = 13
  Chart.defaults.layout.padding = 0
  Chart.defaults.elements.point.radius = 0
  Chart.defaults.elements.point.backgroundColor = '#5e72e4'
  Chart.defaults.elements.line.tension = 0.4
  Chart.defaults.elements.line.borderWidth = 4
  Chart.defaults.elements.line.borderColor = '#5e72e4'
  Chart.defaults.elements.line.backgroundColor = 'transparent'
  Chart.defaults.elements.line.borderCapStyle = 'round'
  Chart.defaults.elements.bar.backgroundColor = '#fb6340'
  Chart.defaults.elements.bar.borderRadius = Number.MAX_VALUE
  Chart.defaults.elements.arc.backgroundColor = '#5e72e4'
  Chart.defaults.elements.arc.borderColor = '#32325d'
  Chart.defaults.elements.arc.borderWidth = 4
  return Chart;
}