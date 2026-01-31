import { getRatingColor, getRankTitle, getRatingBadgeClass } from './rating-colors';

describe('Rating Colors Utilities', () => {
    describe('getRatingColor', () => {
        it('returns gray for undefined rating', () => {
            expect(getRatingColor(undefined)).toBe('text-gray-500');
        });

        it('returns correct color for Newbie (<1200)', () => {
            expect(getRatingColor(1199)).toBe('text-gray-500');
            expect(getRatingColor(0)).toBe('text-gray-500');
        });

        it('returns correct color for Pupil (1200-1399)', () => {
            expect(getRatingColor(1200)).toBe('text-green-500');
            expect(getRatingColor(1399)).toBe('text-green-500');
        });

        it('returns correct color for Specialist (1400-1599)', () => {
            expect(getRatingColor(1400)).toBe('text-cyan-500');
            expect(getRatingColor(1599)).toBe('text-cyan-500');
        });

        it('returns correct color for Expert (1600-1899)', () => {
            expect(getRatingColor(1600)).toBe('text-blue-500');
            expect(getRatingColor(1899)).toBe('text-blue-500');
        });

        it('returns correct color for Candidate Master (1900-2099)', () => {
             expect(getRatingColor(1900)).toBe('text-purple-500');
             expect(getRatingColor(2099)).toBe('text-purple-500');
        });

        it('returns correct color for Master (2100-2299)', () => {
             expect(getRatingColor(2100)).toBe('text-orange-500');
             expect(getRatingColor(2299)).toBe('text-orange-500');
        });

        it('returns correct color for International Master (2300-2399)', () => {
             expect(getRatingColor(2300)).toBe('text-orange-500'); // Note: same color as Master but logic distinct
             expect(getRatingColor(2399)).toBe('text-orange-500');
        });

        it('returns correct color for Grandmaster (2400-2599)', () => {
             expect(getRatingColor(2400)).toBe('text-red-500');
             expect(getRatingColor(2599)).toBe('text-red-500');
        });
        
        it('returns correct color for International Grandmaster (2600-2999)', () => {
             expect(getRatingColor(2600)).toBe('text-red-600 font-bold');
             expect(getRatingColor(2999)).toBe('text-red-600 font-bold');
        });

        it('returns correct color for Legendary Grandmaster (>=3000)', () => {
             expect(getRatingColor(3000)).toBe('text-red-700 font-black');
             expect(getRatingColor(3500)).toBe('text-red-700 font-black');
        });
    });

    describe('getRankTitle', () => {
        it('returns Unrated for undefined', () => {
            expect(getRankTitle(undefined)).toBe('Unrated');
        });

        it('returns Newbie for <1200', () => {
            expect(getRankTitle(1100)).toBe('Newbie');
        });

        it('returns Legendary Grandmaster for >=3000', () => {
            expect(getRankTitle(3200)).toBe('Legendary Grandmaster');
        });
    });

    describe('getRatingBadgeClass', () => {
        it('returns gray badge for undefined', () => {
            expect(getRatingBadgeClass(undefined)).toContain('bg-gray-500');
        });

        it('returns green badge for Pupil', () => {
            expect(getRatingBadgeClass(1300)).toContain('bg-green-500');
        });
    });
});
