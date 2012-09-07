describe("Array", function() {
    describe("indexOf", function() {
        it("should return -1 if an item does not exist in the array", function() {
            expect([1, 2, 3].indexOf(10)).toEqual(-1);
        });
        
        it("should return the index of the item if it exists in the array", function() {
            expect([1, 2, 3, 4].indexOf(3)).toEqual(2);
        });
        
        it("should return the index of the first item if the item is found multiple times", function() {
            expect([1, 2, 3, 1, 2].indexOf(2)).toEqual(1);
        });
        
        describe("when providing an offset value", function() {
            it("should ignore occurrences of the item before the offset", function() {
                expect([1, 2, 3, 4, 3].indexOf(3, 3)).toEqual(4);
            });
        });
    });
    
    describe("removing items", function() {
        var myArray;
        
        it("should do nothing when removing from an empty array", function() {
            myArray = [];

            expect(function() {myArray.remove(1);}).not.toThrow();            
            expect(myArray.length).toEqual(0);
        });
        
        describe("when removing an item inside an array", function() {
            beforeEach(function() {
                myArray = [1, 2, 3, 4, 5];
                
                myArray.remove(1);
            });
            
            it("should remove the item", function() {
                expect(myArray.length).toEqual(4);
            });
            
            it("should update the index of the following items", function() {
                expect(myArray[1]).toEqual(3);
                expect(myArray[2]).toEqual(4);
                expect(myArray[3]).toEqual(5);
            });
        });
    });
    
    describe("contains", function() {
        it("should return false if an item does not exist in the array", function() {
            expect([1, 2, 3].contains(10)).toBe(false);
        });
        
        it("should return true if an item exists in the array", function() {
            expect([8, 9, 10].contains(10)).toBe(true);
        });   
    });
});