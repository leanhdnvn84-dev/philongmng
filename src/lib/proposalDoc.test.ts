import { describe, expect, it } from 'vitest'
import { moneyWords, money, dmy, fileName, type Phieu } from './proposalDoc'
import { ALERT_CODES } from './resources'

describe('moneyWords', () => {
  it('reads Vietnamese amounts', () => {
    expect(moneyWords(0)).toBe('Không đồng')
    expect(moneyWords(3900000)).toBe('Ba triệu chín trăm nghìn đồng')
    expect(moneyWords(1250000)).toBe('Một triệu hai trăm năm mươi nghìn đồng')
    expect(moneyWords(2005)).toBe('Hai nghìn không trăm lẻ năm đồng')
  })
})
describe('formatting', () => {
  it('formats money and dates', () => {
    expect(money(2450000)).toBe('2,450,000')
    expect(money(0)).toBe('')
    expect(dmy('2026-11-09')).toBe('09/11/2026')
  })
})
describe('fileName', () => {
  it('joins code, requester and items, without illegal characters', () => {
    const p = { code: 'DX0049', requester: 'Lê Đình Anh', lines: [{ name: 'Nhôm hộp' }, { name: 'Keo: trắng/đen' }] } as unknown as Phieu
    expect(fileName(p)).toBe('DX0049 - Lê Đình Anh - Nhôm hộp, Keo trắng đen')
  })
})
describe('alert codes', () => {
  it('has a Vietnamese label for every V191 alert', () => {
    for (const k of ['CONG_VIEC_QUA_HAN', 'CVHN_CHUA_XONG', 'BAO_TRI_DEN_HAN', 'DE_XUAT_CHO_DUYET']) expect(ALERT_CODES[k]).toBeTruthy()
  })
})
