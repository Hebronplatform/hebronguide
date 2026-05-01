import svgPaths from "./svg-uguh2ql8id";
import imgHeroCardSection from "figma:asset/192be0315fbee450067b5cec733ab5600b865bef.png";
import imgAb6AXuBRrTMkeTvKlwNAlWthpPLfAozbE3J2Nn5KsqTd8BfPvMhQcg2LsdD7K6VWWimrgaY3SYiRr9OA66M8C51UauhyiOdNc0W7DMzhwT4Ekp3VCer8BMdg2JUvDaNfmYRjaQi8DF7RJpa9S1YuYyggliqqrxoiL9JaOazw4MgXt8FHhzvLdpPs1Zt4JB9Azt5WpHpRa59B9QlkVzn0UzedhNqWxxAv0NKi3ZUxPcKd1LteilNqi8Qr0Kbmtc4BjMwRht5287FxP0L6 from "figma:asset/fe381a34067adeb6e9caadfc0a4e850da80c76af.png";
import imgAb6AXuArRu77WpCs35MZjY6QjsaBhIhe2RoVpljlMZaACq0A8TzpqZvIdoE984QSgwOguKlu0Ugc15M0Gz8NRaUsWzvuma7LmrqFjxGahyxvYaPaOxjm6Hnx8LYeSe8QmJuu8T5Wo6Gx3IrywWqsgMq5RIIbVGz8NVDHl0BF9Y9ToZcUrEuViuNKjgVfQnCfkqcty6Bqtevln3NKxog4JdtkBs4Jqjg11FdNg8JLKazaqEtGySeWdHGMbqvTJsB065CeNEwqjSay from "figma:asset/63b376d5837a1a7af896901fec0ae775f193cf30.png";

function OverlayOverlayBlur() {
  return (
    <div className="backdrop-blur-[6px] bg-[rgba(255,255,255,0.1)] content-stretch flex items-start px-[12px] py-[4px] relative rounded-[12px] shrink-0" data-name="Overlay+OverlayBlur">
      <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#ecfdf5] text-[10px] tracking-[1px] uppercase whitespace-nowrap">
        <p className="leading-[15px]">WELCOME TO SEATTLE</p>
      </div>
    </div>
  );
}

function Heading1() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[4px] relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[36px] text-white tracking-[-1.8px] w-full">
        <p className="leading-[45px] mb-0">시애틀 정착 가이</p>
        <p className="leading-[45px]">드</p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Manrope:Light',sans-serif] font-light justify-center leading-[0] relative shrink-0 text-[14px] text-[rgba(209,250,229,0.7)] tracking-[0.35px] uppercase w-full">
        <p className="leading-[20px]">NAVIGATING THE EMERALD CITY</p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full" data-name="Container">
      <OverlayOverlayBlur />
      <Heading1 />
      <Container2 />
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[10px] text-[rgba(167,243,208,0.6)] tracking-[0.5px] uppercase w-full">
        <p className="leading-[15px]">TEMPERATURE</p>
      </div>
    </div>
  );
}

function Margin() {
  return (
    <div className="relative shrink-0 w-full" data-name="Margin">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[4px] relative size-full">
        <Container3 />
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#ecfdf5] text-[24px] whitespace-nowrap">
        <p className="leading-[32px]">58°F</p>
      </div>
    </div>
  );
}

function Margin1() {
  return (
    <div className="h-[15.25px] relative shrink-0 w-[15.75px]" data-name="Margin">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.7499 15.2499">
        <g id="Margin">
          <path d={svgPaths.p2f20c300} fill="var(--fill-0, #6EE7B7)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container4() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[4px] items-end relative size-full">
        <Container5 />
        <Margin1 />
      </div>
    </div>
  );
}

function OverlayBorderOverlayBlur() {
  return (
    <div className="backdrop-blur-[10px] bg-[rgba(255,255,255,0.05)] col-1 justify-self-stretch relative rounded-[16px] row-1 self-start shrink-0" data-name="Overlay+Border+OverlayBlur">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.1)] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="flex flex-col justify-center size-full">
        <div className="content-stretch flex flex-col items-start justify-center p-[17px] relative size-full">
          <Margin />
          <Container4 />
        </div>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[10px] text-[rgba(167,243,208,0.6)] tracking-[0.5px] uppercase w-full">
        <p className="leading-[15px]">POPULATION</p>
      </div>
    </div>
  );
}

function Margin2() {
  return (
    <div className="relative shrink-0 w-full" data-name="Margin">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[4px] relative size-full">
        <Container6 />
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#ecfdf5] text-[24px] w-full">
          <p className="leading-[32px]">737K</p>
        </div>
      </div>
    </div>
  );
}

function OverlayBorderOverlayBlur1() {
  return (
    <div className="backdrop-blur-[10px] bg-[rgba(255,255,255,0.05)] col-2 justify-self-stretch relative rounded-[16px] row-1 self-start shrink-0" data-name="Overlay+Border+OverlayBlur">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.1)] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="flex flex-col justify-center size-full">
        <div className="content-stretch flex flex-col items-start justify-center p-[17px] relative size-full">
          <Margin2 />
          <Container7 />
        </div>
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[10px] text-[rgba(167,243,208,0.6)] tracking-[0.5px] uppercase w-full">
        <p className="leading-[15px]">RENT AVERAGE</p>
      </div>
    </div>
  );
}

function Margin3() {
  return (
    <div className="relative shrink-0 w-full" data-name="Margin">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[4px] relative size-full">
        <Container8 />
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#ecfdf5] text-[24px] w-full">
          <p className="leading-[32px]">$2.4K</p>
        </div>
      </div>
    </div>
  );
}

function OverlayBorderOverlayBlur2() {
  return (
    <div className="backdrop-blur-[10px] bg-[rgba(255,255,255,0.05)] col-1 justify-self-stretch relative rounded-[16px] row-2 self-start shrink-0" data-name="Overlay+Border+OverlayBlur">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.1)] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="flex flex-col justify-center size-full">
        <div className="content-stretch flex flex-col items-start justify-center p-[17px] relative size-full">
          <Margin3 />
          <Container9 />
        </div>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[10px] text-[rgba(167,243,208,0.6)] tracking-[0.5px] uppercase w-full">
        <p className="leading-[15px]">K-COMMUNITY</p>
      </div>
    </div>
  );
}

function Margin4() {
  return (
    <div className="relative shrink-0 w-full" data-name="Margin">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[4px] relative size-full">
        <Container10 />
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#ecfdf5] text-[24px] w-full">
          <p className="leading-[32px]">165K+</p>
        </div>
      </div>
    </div>
  );
}

function OverlayBorderOverlayBlur3() {
  return (
    <div className="backdrop-blur-[10px] bg-[rgba(255,255,255,0.05)] col-2 justify-self-stretch relative rounded-[16px] row-2 self-start shrink-0" data-name="Overlay+Border+OverlayBlur">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.1)] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="flex flex-col justify-center size-full">
        <div className="content-stretch flex flex-col items-start justify-center p-[17px] relative size-full">
          <Margin4 />
          <Container11 />
        </div>
      </div>
    </div>
  );
}

function StatsGrid() {
  return (
    <div className="gap-x-[12px] gap-y-[12px] grid grid-cols-[repeat(2,minmax(0,1fr))] grid-rows-[__85px_85px] relative shrink-0 w-full" data-name="Stats Grid">
      <OverlayBorderOverlayBlur />
      <OverlayBorderOverlayBlur1 />
      <OverlayBorderOverlayBlur2 />
      <OverlayBorderOverlayBlur3 />
    </div>
  );
}

function Container() {
  return (
    <div className="absolute bottom-0 content-stretch flex flex-col gap-[24px] items-start left-0 p-[32px] right-0" data-name="Container">
      <Container1 />
      <StatsGrid />
    </div>
  );
}

function HeroCardSection() {
  return (
    <div className="bg-[rgba(255,255,255,0)] h-[480px] overflow-clip relative rounded-[32px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] shrink-0 w-full" data-name="Hero Card Section">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute h-full left-[-20.18%] max-w-none top-0 w-[140.35%]" src={imgHeroCardSection} />
      </div>
      <div className="absolute bg-gradient-to-t from-[rgba(1,45,29,0.8)] inset-0 to-[rgba(1,45,29,0)] via-1/2 via-[rgba(1,45,29,0)]" data-name="Gradient" />
      <Container />
    </div>
  );
}

function Border() {
  return (
    <div className="content-stretch flex flex-col items-start px-[9px] py-[3px] relative rounded-[12px] shrink-0" data-name="Border">
      <div aria-hidden="true" className="absolute border border-[rgba(53,102,104,0.2)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="flex flex-col font-['Manrope:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#356668] text-[12px] whitespace-nowrap">
        <p className="leading-[16px]">SETTLE FIRST</p>
      </div>
    </div>
  );
}

function Heading2() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Heading 3">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#012d1d] text-[18px] tracking-[-0.45px] whitespace-nowrap">
        <p className="leading-[28px]">정착 필수</p>
      </div>
      <Border />
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="Container">
      <Heading2 />
    </div>
  );
}

function Container14() {
  return (
    <div className="h-[23.75px] relative shrink-0 w-[18.75px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.7499 23.7499">
        <g id="Container">
          <path d={svgPaths.p2ce24f80} fill="var(--fill-0, #1B4332)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function BackgroundShadow() {
  return (
    <div className="bg-[#dfe3e3] content-stretch flex items-center justify-center relative rounded-[20px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 size-[64px]" data-name="Background+Shadow">
      <Container14 />
    </div>
  );
}

function Container15() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#414844] text-[11px] whitespace-nowrap">
        <p className="leading-[16.5px]">Visa</p>
      </div>
    </div>
  );
}

function Row() {
  return (
    <div className="col-1 content-stretch flex flex-col gap-[7px] items-center justify-self-stretch relative row-1 self-start shrink-0" data-name="Row 1">
      <BackgroundShadow />
      <Container15 />
    </div>
  );
}

function Container17() {
  return (
    <div className="h-[21.118px] relative shrink-0 w-[18.75px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.7499 21.1177">
        <g id="Container">
          <path d={svgPaths.p3b345300} fill="var(--fill-0, #1B4332)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function BackgroundShadow1() {
  return (
    <div className="bg-[#dfe3e3] content-stretch flex items-center justify-center relative rounded-[20px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 size-[64px]" data-name="Background+Shadow">
      <Container17 />
    </div>
  );
}

function Container18() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#414844] text-[11px] whitespace-nowrap">
        <p className="leading-[16.5px]">Housing</p>
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="col-2 content-stretch flex flex-col gap-[7px] items-center justify-self-stretch relative row-1 self-start shrink-0" data-name="Container">
      <BackgroundShadow1 />
      <Container18 />
    </div>
  );
}

function Container20() {
  return (
    <div className="h-[20.336px] relative shrink-0 w-[24.904px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24.9037 20.3364">
        <g id="Container">
          <path d={svgPaths.p193ae400} fill="var(--fill-0, #1B4332)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function BackgroundShadow2() {
  return (
    <div className="bg-[#dfe3e3] content-stretch flex items-center justify-center relative rounded-[20px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 size-[64px]" data-name="Background+Shadow">
      <Container20 />
    </div>
  );
}

function Container21() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#414844] text-[11px] whitespace-nowrap">
        <p className="leading-[16.5px]">Schools</p>
      </div>
    </div>
  );
}

function Container19() {
  return (
    <div className="col-3 content-stretch flex flex-col gap-[7px] items-center justify-self-stretch relative row-1 self-start shrink-0" data-name="Container">
      <BackgroundShadow2 />
      <Container21 />
    </div>
  );
}

function Container23() {
  return (
    <div className="h-[18.75px] relative shrink-0 w-[23.75px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23.7499 18.7499">
        <g id="Container">
          <path d={svgPaths.p345dc3a0} fill="var(--fill-0, #1B4332)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function BackgroundShadow3() {
  return (
    <div className="bg-[#dfe3e3] content-stretch flex items-center justify-center relative rounded-[20px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 size-[64px]" data-name="Background+Shadow">
      <Container23 />
    </div>
  );
}

function Container24() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#414844] text-[11px] whitespace-nowrap">
        <p className="leading-[16.5px]">License</p>
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="col-4 content-stretch flex flex-col gap-[7px] items-center justify-self-stretch relative row-1 self-start shrink-0" data-name="Container">
      <BackgroundShadow3 />
      <Container24 />
    </div>
  );
}

function Container25() {
  return (
    <div className="h-[21.875px] relative shrink-0 w-[23.75px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23.7499 21.8749">
        <g id="Container">
          <path d={svgPaths.p1da64f00} fill="var(--fill-0, #1B4332)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function BackgroundShadow4() {
  return (
    <div className="bg-[#dfe3e3] content-stretch flex items-center justify-center relative rounded-[20px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 size-[64px]" data-name="Background+Shadow">
      <Container25 />
    </div>
  );
}

function Container26() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#414844] text-[11px] whitespace-nowrap">
        <p className="leading-[16.5px]">Jobs</p>
      </div>
    </div>
  );
}

function Row1() {
  return (
    <div className="col-1 content-stretch flex flex-col gap-[7px] items-center justify-self-stretch relative row-2 self-start shrink-0" data-name="Row 2">
      <BackgroundShadow4 />
      <Container26 />
    </div>
  );
}

function Container28() {
  return (
    <div className="h-[23.125px] relative shrink-0 w-[23.75px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23.7499 23.1249">
        <g id="Container">
          <path d={svgPaths.p3c213f80} fill="var(--fill-0, #1B4332)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function BackgroundShadow5() {
  return (
    <div className="bg-[#dfe3e3] content-stretch flex items-center justify-center relative rounded-[20px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 size-[64px]" data-name="Background+Shadow">
      <Container28 />
    </div>
  );
}

function Container29() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#414844] text-[11px] whitespace-nowrap">
        <p className="leading-[16.5px]">Health</p>
      </div>
    </div>
  );
}

function Container27() {
  return (
    <div className="col-2 content-stretch flex flex-col gap-[7px] items-center justify-self-stretch relative row-2 self-start shrink-0" data-name="Container">
      <BackgroundShadow5 />
      <Container29 />
    </div>
  );
}

function Container31() {
  return (
    <div className="h-[21.875px] relative shrink-0 w-[24.528px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24.5284 21.875">
        <g id="Container">
          <path d={svgPaths.p2de11280} fill="var(--fill-0, #1B4332)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function BackgroundShadow6() {
  return (
    <div className="bg-[#dfe3e3] content-stretch flex items-center justify-center relative rounded-[20px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 size-[64px]" data-name="Background+Shadow">
      <Container31 />
    </div>
  );
}

function Container32() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#414844] text-[11px] whitespace-nowrap">
        <p className="leading-[16.5px]">Markets</p>
      </div>
    </div>
  );
}

function Container30() {
  return (
    <div className="col-3 content-stretch flex flex-col gap-[7px] items-center justify-self-stretch relative row-2 self-start shrink-0" data-name="Container">
      <BackgroundShadow6 />
      <Container32 />
    </div>
  );
}

function Container34() {
  return (
    <div className="h-[23.678px] relative shrink-0 w-[23.077px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23.0768 23.6778">
        <g id="Container">
          <path d={svgPaths.p3c662d00} fill="var(--fill-0, #1B4332)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function BackgroundShadow7() {
  return (
    <div className="bg-[#dfe3e3] content-stretch flex items-center justify-center relative rounded-[20px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 size-[64px]" data-name="Background+Shadow">
      <Container34 />
    </div>
  );
}

function Container35() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#414844] text-[11px] whitespace-nowrap">
        <p className="leading-[16.5px]">Bank</p>
      </div>
    </div>
  );
}

function Container33() {
  return (
    <div className="col-4 content-stretch flex flex-col gap-[7px] items-center justify-self-stretch relative row-2 self-start shrink-0" data-name="Container">
      <BackgroundShadow7 />
      <Container35 />
    </div>
  );
}

function Container13() {
  return (
    <div className="gap-x-[16px] gap-y-[16px] grid grid-cols-[repeat(4,minmax(0,1fr))] grid-rows-[__88.50px_88.50px] relative shrink-0 w-full" data-name="Container">
      <Row />
      <Container16 />
      <Container19 />
      <Container22 />
      <Row1 />
      <Container27 />
      <Container30 />
      <Container33 />
    </div>
  );
}

function SettleFirstSection() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full" data-name="Settle First Section">
      <Container12 />
      <Container13 />
    </div>
  );
}

function Heading3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-['Manrope:ExtraBold',sans-serif] font-extrabold justify-center leading-[0] relative shrink-0 text-[#012d1d] text-[18px] tracking-[-0.45px] w-full">
        <p className="leading-[28px]">시애틀 생활 팁 / LIFESTYLE TIPS</p>
      </div>
    </div>
  );
}

function Ab6AXuBRrTMkeTvKlwNAlWthpPLfAozbE3J2Nn5KsqTd8BfPvMhQcg2LsdD7K6VWWimrgaY3SYiRr9OA66M8C51UauhyiOdNc0W7DMzhwT4Ekp3VCer8BMdg2JUvDaNfmYRjaQi8DF7RJpa9S1YuYyggliqqrxoiL9JaOazw4MgXt8FHhzvLdpPs1Zt4JB9Azt5WpHpRa59B9QlkVzn0UzedhNqWxxAv0NKi3ZUxPcKd1LteilNqi8Qr0Kbmtc4BjMwRht5287FxP0L() {
  return (
    <div className="h-[256.5px] relative shrink-0 w-full" data-name="AB6AXuBRrTMkeTvKlwNAlWthpPLfAozbE3J2Nn5ksqTD8BFPvMhQCG2lsdD7K6vWWimrgaY3sYiRR9oA66m8c51uauhyiOdNc0w7DMzhw_T4ekp3vCER8BMdg2jUvDaNfmYRjaQi8dF7rJpa9s1yuYyggliqqrxoiL9JAOazw4MGXt8fHhzvLDPPs1-ZT4jB9AZT5WpHpRa59b9QlkVzn0UZEDHNqWxxAv0nKi3zUxPCKd1Lteil_Nqi8QR0kbmtc4BjMwRHT52_87FxP0l6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute h-[133.33%] left-0 max-w-none top-[-16.67%] w-full" src={imgAb6AXuBRrTMkeTvKlwNAlWthpPLfAozbE3J2Nn5KsqTd8BfPvMhQcg2LsdD7K6VWWimrgaY3SYiRr9OA66M8C51UauhyiOdNc0W7DMzhwT4Ekp3VCer8BMdg2JUvDaNfmYRjaQi8DF7RJpa9S1YuYyggliqqrxoiL9JaOazw4MgXt8FHhzvLdpPs1Zt4JB9Azt5WpHpRa59B9QlkVzn0UzedhNqWxxAv0NKi3ZUxPcKd1LteilNqi8Qr0Kbmtc4BjMwRht5287FxP0L6} />
      </div>
    </div>
  );
}

function Overlay() {
  return (
    <div className="bg-[rgba(185,236,238,0.5)] content-stretch flex items-start px-[12px] py-[4px] relative rounded-[12px] shrink-0" data-name="Overlay">
      <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#356668] text-[10px] tracking-[1px] uppercase whitespace-nowrap">
        <p className="leading-[15px]">BEST COFFEE SPOTS</p>
      </div>
    </div>
  );
}

function Heading4() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[1.1px] relative shrink-0 w-full" data-name="Heading 4">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#012d1d] text-[24px] whitespace-nowrap">
        <p className="leading-[30px] mb-0">로컬이 추천하는 안개 낀</p>
        <p className="leading-[30px] mb-0">날 가기 좋은 카페 베스트</p>
        <p className="leading-[30px]">5</p>
      </div>
    </div>
  );
}

function Container38() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[0.625px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#414844] text-[14px] whitespace-nowrap">
        <p className="leading-[22.75px] mb-0">흐린 날씨가 매력적인 시애틀에서 즐기는 따</p>
        <p className="leading-[22.75px]">뜻한 라떼 한 잔의 여유...</p>
      </div>
    </div>
  );
}

function Container37() {
  return (
    <div className="absolute bottom-0 content-stretch flex flex-col gap-[10.9px] items-start left-0 p-[32px]" data-name="Container">
      <Overlay />
      <Heading4 />
      <Container38 />
    </div>
  );
}

function Container36() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center overflow-clip relative rounded-[32px] shrink-0 w-full" data-name="Container">
      <Ab6AXuBRrTMkeTvKlwNAlWthpPLfAozbE3J2Nn5KsqTd8BfPvMhQcg2LsdD7K6VWWimrgaY3SYiRr9OA66M8C51UauhyiOdNc0W7DMzhwT4Ekp3VCer8BMdg2JUvDaNfmYRjaQi8DF7RJpa9S1YuYyggliqqrxoiL9JaOazw4MgXt8FHhzvLdpPs1Zt4JB9Azt5WpHpRa59B9QlkVzn0UzedhNqWxxAv0NKi3ZUxPcKd1LteilNqi8Qr0Kbmtc4BjMwRht5287FxP0L />
      <div className="absolute bg-gradient-to-b from-[rgba(246,250,250,0)] inset-0 to-[#f6fafa] to-[95%]" data-name="Gradient" />
      <Container37 />
    </div>
  );
}

function SectionSignatureComponentMistOverlayFeatured() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start pt-[16px] relative shrink-0 w-full" data-name="Section - Signature Component: Mist Overlay Featured">
      <Heading3 />
      <Container36 />
    </div>
  );
}

function Main() {
  return (
    <div className="max-w-[672px] relative shrink-0 w-full" data-name="Main">
      <div className="content-stretch flex flex-col gap-[48px] items-start max-w-[inherit] pt-[80px] px-[24px] relative size-full">
        <HeroCardSection />
        <SettleFirstSection />
        <SectionSignatureComponentMistOverlayFeatured />
      </div>
    </div>
  );
}

function Ab6AXuArRu77WpCs35MZjY6QjsaBhIhe2RoVpljlMZaACq0A8TzpqZvIdoE984QSgwOguKlu0Ugc15M0Gz8NRaUsWzvuma7LmrqFjxGahyxvYaPaOxjm6Hnx8LYeSe8QmJuu8T5Wo6Gx3IrywWqsgMq5RIIbVGz8NVDHl0BF9Y9ToZcUrEuViuNKjgVfQnCfkqcty6Bqtevln3NKxog4JdtkBs4Jqjg11FdNg8JLKazaqEtGySeWdHGMbqvTJsB065CeNEwqjSay() {
  return (
    <div className="flex-[1_0_0] min-h-px relative w-full" data-name="AB6AXuARRu77wpCs35mZjY6QjsaBHIhe2RoVpljl-mZaA-cq0A8tzpqZvIdoE984qSGWOguKLU0Ugc15m0Gz8nRaUs_wzvuma7LmrqFJXGahyxv-YaPAOxjm6hnx8lYeSe8QMJuu8T5WO6Gx3irywWQSGMq5rIIbV_gz8n_vDHl0bF9y9ToZCUrEuViu_nKjgVfQNCfkqcty6bqtevln3nKXOG4JdtkBs4JQJG11fdNg8jLKazaqETGySEWdH-GMbqvTJsB065ceNEwqjSAY">
      <div className="absolute bg-clip-padding border-0 border-[transparent] border-solid inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgAb6AXuArRu77WpCs35MZjY6QjsaBhIhe2RoVpljlMZaACq0A8TzpqZvIdoE984QSgwOguKlu0Ugc15M0Gz8NRaUsWzvuma7LmrqFjxGahyxvYaPaOxjm6Hnx8LYeSe8QmJuu8T5Wo6Gx3IrywWqsgMq5RIIbVGz8NVDHl0BF9Y9ToZcUrEuViuNKjgVfQnCfkqcty6Bqtevln3NKxog4JdtkBs4Jqjg11FdNg8JLKazaqEtGySeWdHGMbqvTJsB065CeNEwqjSay} />
      </div>
    </div>
  );
}

function Border1() {
  return (
    <div className="relative rounded-[12px] shrink-0 size-[32px]" data-name="Border">
      <div className="content-stretch flex flex-col items-start justify-center overflow-clip p-px relative rounded-[inherit] size-full">
        <Ab6AXuArRu77WpCs35MZjY6QjsaBhIhe2RoVpljlMZaACq0A8TzpqZvIdoE984QSgwOguKlu0Ugc15M0Gz8NRaUsWzvuma7LmrqFjxGahyxvYaPaOxjm6Hnx8LYeSe8QmJuu8T5Wo6Gx3IrywWqsgMq5RIIbVGz8NVDHl0BF9Y9ToZcUrEuViuNKjgVfQnCfkqcty6Bqtevln3NKxog4JdtkBs4Jqjg11FdNg8JLKazaqEtGySeWdHGMbqvTJsB065CeNEwqjSay />
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.2)] border-solid inset-0 pointer-events-none rounded-[12px]" />
    </div>
  );
}

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Heading 1">
      <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#ecfdf5] text-[20px] tracking-[-0.4px] whitespace-nowrap">
        <p className="leading-[28px]">THE MISTY PATH</p>
      </div>
    </div>
  );
}

function Container39() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] items-center relative size-full">
        <Border1 />
        <Heading />
      </div>
    </div>
  );
}

function Container40() {
  return (
    <div className="relative shrink-0 size-[17.192px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.1922 17.1922">
        <g id="Container">
          <path d={svgPaths.p10cae140} fill="var(--fill-0, #ECFDF5)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[12px] size-[40px]" data-name="Button">
      <Container40 />
    </div>
  );
}

function ButtonCssTransform() {
  return (
    <div className="h-[64px] relative shrink-0" data-name="Button:css-transform">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start justify-center pb-[13.5px] pt-[12.5px] relative size-full">
        <div className="flex items-center justify-center relative shrink-0 size-[38px]" style={{ "--transform-inner-width": "1185", "--transform-inner-height": "21" } as React.CSSProperties}>
          <div className="flex-none scale-x-95 scale-y-95">
            <Button />
          </div>
        </div>
      </div>
    </div>
  );
}

function HeaderTopAppBar() {
  return (
    <div className="absolute backdrop-blur-[12px] bg-[rgba(2,44,34,0.7)] content-stretch flex h-[65px] items-center justify-between left-0 pb-px pl-[24px] pr-[25px] top-0 w-[390px]" data-name="Header - TopAppBar">
      <div aria-hidden="true" className="absolute border-[rgba(255,255,255,0.05)] border-b border-solid inset-0 pointer-events-none" />
      <div className="absolute bg-[rgba(255,255,255,0)] h-[64px] left-0 shadow-[0px_40px_60px_-5px_rgba(0,0,0,0.05)] top-0 w-[390px]" data-name="Header - TopAppBar:shadow" />
      <Container39 />
      <ButtonCssTransform />
    </div>
  );
}

function Container41() {
  return (
    <div className="h-[18px] relative shrink-0 w-[16px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 18">
        <g id="Container">
          <path d={svgPaths.p1820480} fill="var(--fill-0, #ECFDF5)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Margin5() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[2px] relative shrink-0" data-name="Margin">
      <div className="flex flex-col font-['Manrope:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#ecfdf5] text-[10px] tracking-[0.5px] uppercase whitespace-nowrap">
        <p className="leading-[15px]">HOME</p>
      </div>
    </div>
  );
}

function LinkHomeActive() {
  return (
    <div className="bg-[rgba(4,120,87,0.4)] relative rounded-[12px] shrink-0" data-name="Link - Home Active">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center justify-center px-[20px] py-[8px] relative size-full">
        <Container41 />
        <Margin5 />
      </div>
    </div>
  );
}

function Container42() {
  return (
    <div className="h-[18.635px] relative shrink-0 w-[16.115px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.1152 18.6345">
        <g id="Container">
          <path d={svgPaths.p247d6300} fill="var(--fill-0, #6EE7B7)" fillOpacity="0.5" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Margin6() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[2px] relative shrink-0" data-name="Margin">
      <div className="flex flex-col font-['Manrope:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[10px] text-[rgba(110,231,183,0.5)] tracking-[0.5px] uppercase whitespace-nowrap">
        <p className="leading-[15px]">FORESTS</p>
      </div>
    </div>
  );
}

function Link() {
  return (
    <div className="relative shrink-0" data-name="Link">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center justify-center px-[20px] py-[8px] relative size-full">
        <Container42 />
        <Margin6 />
      </div>
    </div>
  );
}

function Container43() {
  return (
    <div className="h-[14.615px] relative shrink-0 w-[20.404px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20.4037 14.6153">
        <g id="Container">
          <path d={svgPaths.p5df6b00} fill="var(--fill-0, #6EE7B7)" fillOpacity="0.5" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Margin7() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[2px] relative shrink-0" data-name="Margin">
      <div className="flex flex-col font-['Manrope:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[10px] text-[rgba(110,231,183,0.5)] tracking-[0.5px] uppercase whitespace-nowrap">
        <p className="leading-[15px]">COMMUNITY</p>
      </div>
    </div>
  );
}

function Link1() {
  return (
    <div className="relative shrink-0" data-name="Link">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center justify-center px-[20px] py-[8px] relative size-full">
        <Container43 />
        <Margin7 />
      </div>
    </div>
  );
}

function Container44() {
  return (
    <div className="h-[14.615px] relative shrink-0 w-[15px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.9999 14.6153">
        <g id="Container">
          <path d={svgPaths.p2969ea80} fill="var(--fill-0, #6EE7B7)" fillOpacity="0.5" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Margin8() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[2px] relative shrink-0" data-name="Margin">
      <div className="flex flex-col font-['Manrope:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[10px] text-[rgba(110,231,183,0.5)] tracking-[0.5px] uppercase whitespace-nowrap">
        <p className="leading-[15px]">PROFILE</p>
      </div>
    </div>
  );
}

function Link2() {
  return (
    <div className="relative shrink-0" data-name="Link">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center justify-center px-[20px] py-[8px] relative size-full">
        <Container44 />
        <Margin8 />
      </div>
    </div>
  );
}

function BottomNavBar() {
  return (
    <div className="absolute backdrop-blur-[20px] bg-[rgba(6,78,59,0.6)] bottom-[24px] content-stretch flex items-center left-[19.5px] max-w-[448px] p-[9px] rounded-[12px] w-[351px]" data-name="BottomNavBar">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.1)] border-solid inset-0 pointer-events-none rounded-[12px] shadow-[0px_20px_50px_0px_rgba(0,0,0,0.3)]" />
      <LinkHomeActive />
      <Link />
      <Link1 />
      <Link2 />
    </div>
  );
}

export default function HtmlBody() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[128px] relative size-full" style={{ backgroundImage: "linear-gradient(90deg, rgb(246, 250, 250) 0%, rgb(246, 250, 250) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)" }} data-name="Html → Body">
      <Main />
      <HeaderTopAppBar />
      <BottomNavBar />
    </div>
  );
}